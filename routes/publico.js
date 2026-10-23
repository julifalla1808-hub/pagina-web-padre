// Rutas públicas: contenido del sitio, mensajes de contacto y agenda.
const express = require('express');
const rateLimit = require('express-rate-limit');
const { db, leerAjustes, AJUSTES_PUBLICOS } = require('../db');
const agenda = require('../services/agenda');
const correo = require('../services/correo');
const v = require('./validar');

const router = express.Router();

const limiteFormularios = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Ha enviado muchas solicitudes. Intente de nuevo en unos minutos o escríbanos por WhatsApp.' }
});

function leerCoberturas(s) {
  try { return JSON.parse(s.coberturas || '[]'); } catch (e) { return []; }
}

router.get('/contenido', async (req, res, next) => {
  try {
    const [servicios, fotos, ajustes] = await Promise.all([
      db('servicios').orderBy([{ column: 'orden' }, { column: 'id' }]),
      db('fotos').orderBy([{ column: 'orden' }, { column: 'id' }]),
      leerAjustes()
    ]);
    const publicos = {};
    AJUSTES_PUBLICOS.forEach((k) => { publicos[k] = ajustes[k]; });
    res.set('Cache-Control', 'no-cache');
    res.json({
      servicios: servicios.map((s) => Object.assign({}, s, { coberturas: leerCoberturas(s), destacado: Boolean(s.destacado) })),
      fotos,
      ajustes: publicos
    });
  } catch (e) { next(e); }
});

router.post('/mensajes', limiteFormularios, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (b.sitio_web) return res.json({ ok: true }); // campo trampa contra robots
    const nombre = v.texto(b.nombre, { requerido: true, min: 2, max: 120 });
    const telefono = v.telefono(b.telefono);
    const email = v.correo(b.correo);
    const mensaje = v.texto(b.mensaje, { requerido: true, min: 5, max: 2000 });
    if (nombre.error) return res.status(400).json({ error: 'Escriba su nombre.' });
    if (telefono.error) return res.status(400).json({ error: 'Escriba un teléfono válido.' });
    if (email.error) return res.status(400).json({ error: 'El correo no es válido.' });
    if (mensaje.error) return res.status(400).json({ error: 'Escriba su mensaje (mínimo 5 caracteres).' });

    const datos = { nombre: nombre.valor, telefono: telefono.valor, correo: email.valor, mensaje: mensaje.valor };
    await db('mensajes').insert(datos);
    correo.avisoMensaje(await leerAjustes(), datos);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/agenda/dias', async (req, res, next) => {
  try {
    const mes = String(req.query.mes || '');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return res.status(400).json({ error: 'Mes no válido.' });
    res.json({ dias: await agenda.diasDelMes(mes) });
  } catch (e) { next(e); }
});

router.get('/agenda/horas', async (req, res, next) => {
  try {
    const fecha = String(req.query.fecha || '');
    if (!agenda.esFechaValida(fecha)) return res.status(400).json({ error: 'Fecha no válida.' });
    const { horas } = await agenda.horasDelDia(fecha);
    res.json({ horas });
  } catch (e) { next(e); }
});

router.post('/citas', limiteFormularios, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (b.sitio_web) return res.json({ ok: true });
    const nombre = v.texto(b.nombre, { requerido: true, min: 2, max: 120 });
    const telefono = v.telefono(b.telefono);
    const email = v.correo(b.correo);
    const servicio = v.texto(b.servicio, { max: 120 });
    const notas = v.texto(b.notas, { max: 1000 });
    const fecha = String(b.fecha || '');
    const hora = String(b.hora || '');
    if (nombre.error) return res.status(400).json({ error: 'Escriba su nombre.' });
    if (telefono.error) return res.status(400).json({ error: 'Escriba un teléfono válido.' });
    if (email.error) return res.status(400).json({ error: 'El correo no es válido.' });
    if (servicio.error || notas.error) return res.status(400).json({ error: 'Revise los datos del formulario.' });
    if (!agenda.esFechaValida(fecha) || !agenda.esHoraValida(hora)) {
      return res.status(400).json({ error: 'Elija una fecha y una hora válidas.' });
    }

    const ajustes = await leerAjustes();
    const modalidades = Array.isArray(ajustes.modalidades) ? ajustes.modalidades : [];
    if (!modalidades.includes(b.modalidad)) return res.status(400).json({ error: 'Elija cómo quiere su cita.' });

    // Revisar el cupo y guardar dentro de una transacción,
    // para que dos personas no tomen el último espacio al mismo tiempo.
    const cita = await db.transaction(async (trx) => {
      if (db.usaPostgres) await trx.raw('select pg_advisory_xact_lock(hashtext(?))', ['agenda-' + fecha]);
      const { horas, ajustes: aj } = await agenda.horasDelDia(fecha, trx);
      if (!horas.some((h) => h.hora === hora)) return null;
      const nueva = {
        nombre: nombre.valor, telefono: telefono.valor, correo: email.valor,
        fecha, hora, duracion: Number(aj.duracion) || 30, modalidad: b.modalidad,
        servicio: servicio.valor, notas: notas.valor, estado: 'pendiente'
      };
      await trx('citas').insert(nueva);
      return nueva;
    });

    if (!cita) {
      return res.status(409).json({ error: 'Esa hora ya no está disponible. Por favor elija otra.' });
    }

    correo.avisoCita(ajustes, cita);
    correo.confirmacionCliente(ajustes, cita);
    res.status(201).json({ ok: true, cita: { fecha: cita.fecha, hora: cita.hora, modalidad: cita.modalidad, servicio: cita.servicio } });
  } catch (e) { next(e); }
});

module.exports = router;
