// Rutas del panel de administrador (protegidas con sesión).
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { db, leerAjustes, guardarAjustes, AJUSTES_INICIALES } = require('../db');
const agenda = require('../services/agenda');
const v = require('./validar');

const router = express.Router();

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'atendida'];
const MODALIDADES = ['presencial', 'llamada', 'videollamada'];

// ---------- Sesión ----------
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos. Espere 15 minutos.' }
});

router.post('/login', limiteLogin, async (req, res, next) => {
  try {
    const usuario = String((req.body || {}).usuario || '').trim();
    const clave = String((req.body || {}).clave || '');
    const fila = usuario ? await db('usuarios').where({ usuario }).first() : null;
    const valida = fila ? await bcrypt.compare(clave, fila.clave_hash) : await bcrypt.compare(clave, '$2a$10$abcdefghijklmnopqrstuv1234567890123456789012345678901');
    if (!fila || !valida) return res.status(401).json({ error: 'Usuario o clave incorrectos.' });
    req.session.usuarioId = fila.id;
    req.session.usuario = fila.usuario;
    res.json({ ok: true, usuario: fila.usuario });
  } catch (e) { next(e); }
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// Todo lo de aquí para abajo exige sesión iniciada.
router.use((req, res, next) => {
  if (!req.session || !req.session.usuarioId) return res.status(401).json({ error: 'Inicie sesión.' });
  // Protección contra envíos desde otros sitios: los cambios deben traer este encabezado.
  if (req.method !== 'GET' && req.get('X-SGP-Panel') !== '1') return res.status(403).json({ error: 'Solicitud no permitida.' });
  next();
});

router.get('/yo', (req, res) => res.json({ usuario: req.session.usuario }));

router.post('/clave', async (req, res, next) => {
  try {
    const { actual, nueva } = req.body || {};
    if (typeof nueva !== 'string' || nueva.length < 8) return res.status(400).json({ error: 'La nueva clave debe tener mínimo 8 caracteres.' });
    const fila = await db('usuarios').where({ id: req.session.usuarioId }).first();
    if (!fila || !(await bcrypt.compare(String(actual || ''), fila.clave_hash))) return res.status(400).json({ error: 'La clave actual no es correcta.' });
    await db('usuarios').where({ id: fila.id }).update({ clave_hash: await bcrypt.hash(nueva, 10) });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Resumen ----------
router.get('/resumen', async (req, res, next) => {
  try {
    const ajustes = await leerAjustes();
    const hoy = agenda.ahoraEnZona(ajustes.zona).fecha;
    const [citasHoy] = await db('citas').where({ fecha: hoy }).whereNot('estado', 'cancelada').count({ total: '*' });
    const [pendientes] = await db('citas').where('estado', 'pendiente').where('fecha', '>=', hoy).count({ total: '*' });
    const [sinLeer] = await db('mensajes').where({ leido: false }).count({ total: '*' });
    res.json({ hoy, citasHoy: Number(citasHoy.total), pendientes: Number(pendientes.total), mensajesSinLeer: Number(sinLeer.total) });
  } catch (e) { next(e); }
});

// ---------- Citas ----------
router.get('/citas', async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    if (!agenda.esFechaValida(desde) || !agenda.esFechaValida(hasta)) return res.status(400).json({ error: 'Rango de fechas no válido.' });
    const citas = await db('citas').whereBetween('fecha', [desde, hasta]).orderBy([{ column: 'fecha' }, { column: 'hora' }]);
    res.json({ citas });
  } catch (e) { next(e); }
});

router.patch('/citas/:id', async (req, res, next) => {
  try {
    const estado = (req.body || {}).estado;
    if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado no válido.' });
    const n = await db('citas').where({ id: Number(req.params.id) }).update({ estado });
    if (!n) return res.status(404).json({ error: 'Cita no encontrada.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Mensajes ----------
router.get('/mensajes', async (req, res, next) => {
  try {
    res.json({ mensajes: await db('mensajes').orderBy('id', 'desc').limit(300) });
  } catch (e) { next(e); }
});

router.patch('/mensajes/:id', async (req, res, next) => {
  try {
    await db('mensajes').where({ id: Number(req.params.id) }).update({ leido: Boolean((req.body || {}).leido) });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/mensajes/:id', async (req, res, next) => {
  try {
    await db('mensajes').where({ id: Number(req.params.id) }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Servicios ----------
function datosServicio(b) {
  const nombre = v.texto(b.nombre, { requerido: true, min: 2, max: 120 });
  const categoria = v.texto(b.categoria, { max: 60 });
  const descripcion = v.texto(b.descripcion, { max: 600 });
  const precio = v.texto(b.precio, { max: 80 });
  const imagen = v.texto(b.imagen, { max: 400 });
  const orden = Number.isFinite(Number(b.orden)) ? Math.round(Number(b.orden)) : 0;
  const coberturas = (Array.isArray(b.coberturas) ? b.coberturas : String(b.coberturas || '').split('\n'))
    .map((c) => String(c).trim()).filter(Boolean).slice(0, 12).map((c) => c.slice(0, 80));
  if ([nombre, categoria, descripcion, precio, imagen].some((x) => x.error)) return null;
  if (imagen.valor && !/^(\/|https:\/\/)/.test(imagen.valor)) return null;
  return {
    nombre: nombre.valor, categoria: categoria.valor || 'Personas', descripcion: descripcion.valor,
    precio: precio.valor, imagen: imagen.valor, orden, destacado: Boolean(b.destacado),
    coberturas: JSON.stringify(coberturas)
  };
}

router.get('/servicios', async (req, res, next) => {
  try {
    const servicios = await db('servicios').orderBy([{ column: 'orden' }, { column: 'id' }]);
    res.json({ servicios: servicios.map((s) => Object.assign({}, s, { coberturas: JSON.parse(s.coberturas || '[]'), destacado: Boolean(s.destacado) })) });
  } catch (e) { next(e); }
});

router.post('/servicios', async (req, res, next) => {
  try {
    const datos = datosServicio(req.body || {});
    if (!datos) return res.status(400).json({ error: 'Revise los datos del seguro.' });
    await db('servicios').insert(datos);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

router.put('/servicios/:id', async (req, res, next) => {
  try {
    const datos = datosServicio(req.body || {});
    if (!datos) return res.status(400).json({ error: 'Revise los datos del seguro.' });
    await db('servicios').where({ id: Number(req.params.id) }).update(datos);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/servicios/:id', async (req, res, next) => {
  try {
    await db('servicios').where({ id: Number(req.params.id) }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Fotos ----------
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype))
});

let cloudinary = null;
if (process.env.CLOUDINARY_URL) cloudinary = require('cloudinary').v2;

function subirACloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'sgp-seguros' }, (err, r) => (err ? reject(err) : resolve(r.secure_url))).end(buffer);
  });
}

router.get('/fotos', async (req, res, next) => {
  try {
    res.json({ fotos: await db('fotos').orderBy([{ column: 'orden' }, { column: 'id' }]), nube: Boolean(cloudinary) });
  } catch (e) { next(e); }
});

router.post('/fotos', subida.single('foto'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Elija una imagen JPG, PNG o WEBP de máximo 5 MB.' });
    const descripcion = v.texto((req.body || {}).descripcion, { max: 200 }).valor || '';
    let url;
    if (cloudinary) {
      url = await subirACloudinary(req.file.buffer);
    } else {
      const carpeta = path.join(__dirname, '..', 'uploads');
      fs.mkdirSync(carpeta, { recursive: true });
      const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[req.file.mimetype];
      const nombre = crypto.randomBytes(8).toString('hex') + ext;
      fs.writeFileSync(path.join(carpeta, nombre), req.file.buffer);
      url = '/uploads/' + nombre;
    }
    const [{ max }] = await db('fotos').max({ max: 'orden' });
    await db('fotos').insert({ url, descripcion, orden: (Number(max) || 0) + 1 });
    res.status(201).json({ ok: true, url });
  } catch (e) { next(e); }
});

router.put('/fotos/:id', async (req, res, next) => {
  try {
    const descripcion = v.texto((req.body || {}).descripcion, { max: 200 });
    if (descripcion.error) return res.status(400).json({ error: 'Descripción muy larga.' });
    const orden = Math.round(Number((req.body || {}).orden) || 0);
    await db('fotos').where({ id: Number(req.params.id) }).update({ descripcion: descripcion.valor, orden });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/fotos/:id', async (req, res, next) => {
  try {
    await db('fotos').where({ id: Number(req.params.id) }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Horarios ----------
router.get('/horarios', async (req, res, next) => {
  try {
    res.json({ horarios: await db('horarios').orderBy([{ column: 'dia_semana' }, { column: 'hora_inicio' }]) });
  } catch (e) { next(e); }
});

router.put('/horarios', async (req, res, next) => {
  try {
    const lista = Array.isArray((req.body || {}).horarios) ? req.body.horarios : null;
    if (!lista || lista.length > 50) return res.status(400).json({ error: 'Lista de horarios no válida.' });
    const filas = [];
    for (const h of lista) {
      const dia = v.entero(h.dia_semana, 0, 6);
      if (dia.error || !agenda.esHoraValida(h.hora_inicio) || !agenda.esHoraValida(h.hora_fin)) return res.status(400).json({ error: 'Revise los días y horas.' });
      if (agenda.aMinutos(h.hora_fin) <= agenda.aMinutos(h.hora_inicio)) return res.status(400).json({ error: 'La hora final debe ser mayor que la inicial.' });
      filas.push({ dia_semana: dia.valor, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, activo: h.activo !== false });
    }
    await db.transaction(async (trx) => {
      await trx('horarios').del();
      if (filas.length) await trx('horarios').insert(filas);
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Bloqueos ----------
router.get('/bloqueos', async (req, res, next) => {
  try {
    const hoy = agenda.ahoraEnZona((await leerAjustes()).zona).fecha;
    res.json({ bloqueos: await db('bloqueos').where('fecha', '>=', hoy).orderBy([{ column: 'fecha' }, { column: 'hora_inicio' }]) });
  } catch (e) { next(e); }
});

router.post('/bloqueos', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!agenda.esFechaValida(b.fecha)) return res.status(400).json({ error: 'Fecha no válida.' });
    const diaCompleto = !b.hora_inicio;
    if (!diaCompleto && (!agenda.esHoraValida(b.hora_inicio) || !agenda.esHoraValida(b.hora_fin) || agenda.aMinutos(b.hora_fin) <= agenda.aMinutos(b.hora_inicio))) {
      return res.status(400).json({ error: 'Revise las horas del bloqueo.' });
    }
    const motivo = v.texto(b.motivo, { max: 160 });
    await db('bloqueos').insert({
      fecha: b.fecha,
      hora_inicio: diaCompleto ? null : b.hora_inicio,
      hora_fin: diaCompleto ? null : b.hora_fin,
      motivo: motivo.valor || ''
    });
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/bloqueos/:id', async (req, res, next) => {
  try {
    await db('bloqueos').where({ id: Number(req.params.id) }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Ajustes ----------
router.get('/ajustes', async (req, res, next) => {
  try { res.json({ ajustes: await leerAjustes() }); } catch (e) { next(e); }
});

router.put('/ajustes', async (req, res, next) => {
  try {
    const b = req.body || {};
    const cambios = {};
    const textos = { nombre: 80, eslogan: 120, mensajeWhatsapp: 300, ciudad: 80, direccion: 200, horarioTexto: 160, facebook: 300, instagram: 300 };
    for (const [k, max] of Object.entries(textos)) {
      if (k in b) {
        const t = v.texto(b[k], { max });
        if (t.error) return res.status(400).json({ error: `El campo ${k} es muy largo.` });
        cambios[k] = t.valor;
      }
    }
    for (const k of ['facebook', 'instagram']) {
      if (cambios[k] && !/^https:\/\//.test(cambios[k])) return res.status(400).json({ error: 'Las redes deben ser enlaces que empiecen por https://' });
    }
    if ('whatsapp' in b) {
      const w = String(b.whatsapp).replace(/\D/g, '');
      if (w.length < 10 || w.length > 15) return res.status(400).json({ error: 'WhatsApp con indicativo, ej. 573207165772.' });
      cambios.whatsapp = w;
    }
    for (const k of ['correoAvisos', 'correoPublico']) {
      if (k in b) {
        const c = v.correo(b[k]);
        if (c.error) return res.status(400).json({ error: 'Revise los correos.' });
        cambios[k] = c.valor;
      }
    }
    const numeros = { duracion: [10, 240], cupos: [1, 50], anticipacion: [0, 10080], diasMaximos: [1, 365] };
    for (const [k, [min, max]] of Object.entries(numeros)) {
      if (k in b) {
        const n = v.entero(b[k], min, max);
        if (n.error) return res.status(400).json({ error: `Valor no válido en ${k}.` });
        cambios[k] = n.valor;
      }
    }
    if ('modalidades' in b) {
      const m = Array.isArray(b.modalidades) ? b.modalidades.filter((x) => MODALIDADES.includes(x)) : [];
      if (!m.length) return res.status(400).json({ error: 'Active al menos una modalidad de cita.' });
      cambios.modalidades = m;
    }
    if ('zona' in b) {
      try { new Intl.DateTimeFormat('es', { timeZone: b.zona }); cambios.zona = b.zona; } catch (e) { return res.status(400).json({ error: 'Zona horaria no válida.' }); }
    }
    await guardarAjustes(cambios);
    res.json({ ok: true, ajustes: await leerAjustes() });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.AJUSTES_INICIALES = AJUSTES_INICIALES;
