// Avisos por correo con Gmail (contraseña de aplicación).
// Si no hay credenciales, los avisos solo se muestran en la consola.
const nodemailer = require('nodemailer');
const { hora12 } = require('../public/js/agenda-comun.js');

const usuario = process.env.GMAIL_USUARIO;
const clave = process.env.GMAIL_CLAVE_APP;

const transporte = usuario && clave
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: usuario, pass: clave } })
  : null;

const MODALIDADES = { presencial: 'En persona', llamada: 'Llamada', videollamada: 'Videollamada' };

function escapar(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fechaLarga(fecha) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(Date.UTC(a, m - 1, d)));
}

function plantilla(titulo, filas, pie) {
  const cuerpo = filas
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#5b6b7f">${escapar(k)}</td><td style="padding:6px 12px;color:#0b1a2c"><b>${escapar(v)}</b></td></tr>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e3e8ef;border-radius:10px;overflow:hidden">
    <div style="background:#0b1a2c;color:#fff;padding:18px 22px;font-size:18px"><b>SGP SEGUROS</b><br><span style="color:#2bb3c4;font-size:13px">Su seguridad primero</span></div>
    <div style="height:4px;background:linear-gradient(90deg,#1a95a8 50%,#e3202b 50%)"></div>
    <div style="padding:20px 22px"><h2 style="margin:0 0 12px;color:#0b1a2c;font-size:18px">${escapar(titulo)}</h2>
    <table style="border-collapse:collapse;width:100%">${cuerpo}</table>
    ${pie ? `<p style="color:#5b6b7f;font-size:13px;margin-top:16px">${escapar(pie)}</p>` : ''}</div></div>`;
}

async function enviar(para, asunto, html) {
  if (!para) return;
  if (!transporte) {
    console.log(`[correo sin configurar] Para: ${para} | Asunto: ${asunto}`);
    return;
  }
  try {
    await transporte.sendMail({ from: `"SGP Seguros" <${usuario}>`, to: para, subject: asunto, html });
  } catch (error) {
    console.error('No se pudo enviar el correo:', error.message);
  }
}

function avisoMensaje(ajustes, m) {
  return enviar(ajustes.correoAvisos, `Nuevo mensaje de ${m.nombre}`, plantilla('Nuevo mensaje desde la página web', [
    ['Nombre', m.nombre], ['Teléfono', m.telefono], ['Correo', m.correo], ['Mensaje', m.mensaje]
  ]));
}

function avisoCita(ajustes, c) {
  return enviar(ajustes.correoAvisos, `Nueva cita: ${fechaLarga(c.fecha)} ${hora12(c.hora)}`, plantilla('Nueva cita agendada', [
    ['Cliente', c.nombre], ['Teléfono', c.telefono], ['Correo', c.correo],
    ['Fecha', fechaLarga(c.fecha)], ['Hora', hora12(c.hora)],
    ['Modalidad', MODALIDADES[c.modalidad]], ['Seguro', c.servicio], ['Notas', c.notas]
  ], 'Confírmela desde el panel de administrador.'));
}

function confirmacionCliente(ajustes, c) {
  if (!c.correo) return Promise.resolve();
  const lugar = c.modalidad === 'presencial'
    ? (ajustes.direccion || `${ajustes.ciudad} (le confirmaremos la dirección por WhatsApp)`)
    : (c.modalidad === 'llamada' ? 'Le llamaremos al número que nos dio' : 'Le enviaremos el enlace de la videollamada');
  return enviar(c.correo, 'Recibimos su solicitud de cita – SGP Seguros', plantilla(`Hola ${c.nombre}, recibimos su cita`, [
    ['Fecha', fechaLarga(c.fecha)], ['Hora', hora12(c.hora)],
    ['Modalidad', MODALIDADES[c.modalidad]], ['Lugar', lugar], ['Seguro', c.servicio]
  ], 'Un asesor confirmará su cita muy pronto. Si necesita cambiarla, escríbanos por WhatsApp.'));
}

module.exports = { avisoMensaje, avisoCita, confirmacionCliente, escapar };
