// Prueba completa del servidor con una base de datos temporal.
// Ejecutar después de "npm install":  npm test
const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');
const A = require('../public/js/agenda-comun.js');

const PUERTO = 3999;
const URL = 'http://localhost:' + PUERTO;
const archivo = path.join(os.tmpdir(), 'sgp-prueba-' + Date.now() + '.sqlite');

const servidor = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
  env: Object.assign({}, process.env, { PORT: PUERTO, SQLITE_ARCHIVO: archivo, ADMIN_USUARIO: 'admin', ADMIN_CLAVE: 'prueba12345', DATABASE_URL: '', GMAIL_USUARIO: '', NODE_ENV: 'test' }),
  stdio: ['ignore', 'pipe', 'inherit']
});

function esperarArranque() {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('El servidor no arrancó')), 15000);
    servidor.stdout.on('data', (d) => { if (String(d).includes('listo')) { clearTimeout(t); resolve(); } });
    servidor.on('exit', (c) => reject(new Error('El servidor se cerró con código ' + c)));
  });
}

let cookie = '';
async function pedir(metodo, ruta, cuerpo, extra) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
  if (cookie) headers.Cookie = cookie;
  const r = await fetch(URL + ruta, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const c = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  if (c.length) cookie = c.map((x) => x.split(';')[0]).join('; ');
  return { estado: r.status, datos: await r.json().catch(() => ({})) };
}
const admin = (m, ruta, cuerpo) => pedir(m, '/api/admin' + ruta, cuerpo, { 'X-SGP-Panel': '1' });

function proximoLunes() {
  let f = A.sumarDias(A.ahoraEnZona('America/Bogota').fecha, 1);
  while (A.diaSemana(f) !== 1) f = A.sumarDias(f, 1);
  return f;
}

const cliente = { nombre: 'Ana Prueba', telefono: '3001234567', correo: 'ana@example.com', servicio: 'Seguro de Autos Todo Riesgo' };

(async () => {
  let n = 0;
  const ok = (t) => { n++; console.log('  ✓ ' + t); };
  try {
    await esperarArranque();
    console.log('API');

    const c = await pedir('GET', '/api/contenido');
    assert.strictEqual(c.estado, 200);
    assert.strictEqual(c.datos.servicios.length, 6);
    assert.strictEqual(c.datos.ajustes.whatsapp, '573207165772');
    assert.ok(!('correoAvisos' in c.datos.ajustes), 'no debe exponer el correo de avisos');
    ok('carga el contenido');

    const m = await pedir('POST', '/api/mensajes', { nombre: 'Luis', telefono: '3101234567', mensaje: 'Quiero cotizar mi moto' });
    assert.strictEqual(m.estado, 201);
    assert.strictEqual((await pedir('POST', '/api/mensajes', { nombre: '', telefono: '1', mensaje: '' })).estado, 400);
    ok('guarda un mensaje y rechaza datos incompletos');

    const lunes = proximoLunes();
    const h = await pedir('GET', '/api/agenda/horas?fecha=' + lunes);
    assert.strictEqual(h.datos.horas.length, 20);
    const dias = await pedir('GET', '/api/agenda/dias?mes=' + lunes.slice(0, 7));
    assert.ok(dias.datos.dias.includes(lunes));
    ok('muestra días y horas libres');

    const c1 = await pedir('POST', '/api/citas', Object.assign({}, cliente, { modalidad: 'presencial', fecha: lunes, hora: '09:00' }));
    assert.strictEqual(c1.estado, 201);
    const c2 = await pedir('POST', '/api/citas', Object.assign({}, cliente, { modalidad: 'llamada', fecha: lunes, hora: '10:00' }));
    assert.strictEqual(c2.estado, 201);
    ok('agenda una cita en persona y otra por llamada');

    const repetida = await pedir('POST', '/api/citas', Object.assign({}, cliente, { modalidad: 'videollamada', fecha: lunes, hora: '09:00' }));
    assert.strictEqual(repetida.estado, 409);
    ok('rechaza otra cita en una franja llena');

    const pasada = await pedir('POST', '/api/citas', Object.assign({}, cliente, { modalidad: 'llamada', fecha: '2020-01-06', hora: '09:00' }));
    assert.strictEqual(pasada.estado, 409);
    ok('rechaza una fecha pasada');

    assert.strictEqual((await pedir('POST', '/api/admin/login', { usuario: 'admin', clave: 'mala' })).estado, 401);
    cookie = '';
    assert.strictEqual((await pedir('POST', '/api/admin/login', { usuario: 'admin', clave: 'prueba12345' })).estado, 200);
    assert.strictEqual((await admin('GET', '/yo')).estado, 200);
    ok('login incorrecto y correcto');

    const sinEncabezado = await pedir('PUT', '/api/admin/ajustes', { cupos: 2 });
    assert.strictEqual(sinEncabezado.estado, 403);
    ok('bloquea cambios sin el encabezado del panel');

    const martes = A.sumarDias(lunes, 1);
    assert.strictEqual((await admin('POST', '/bloqueos', { fecha: martes })).estado, 201);
    assert.strictEqual((await pedir('GET', '/api/agenda/horas?fecha=' + martes)).datos.horas.length, 0);
    const bloqueada = await pedir('POST', '/api/citas', Object.assign({}, cliente, { modalidad: 'llamada', fecha: martes, hora: '09:00' }));
    assert.strictEqual(bloqueada.estado, 409);
    ok('rechaza citas en un día bloqueado');

    const horarios = [1, 2, 3, 4, 5].map((d) => ({ dia_semana: d, hora_inicio: '08:00', hora_fin: '12:00' }));
    assert.strictEqual((await admin('PUT', '/horarios', { horarios })).estado, 200);
    assert.strictEqual((await pedir('GET', '/api/agenda/horas?fecha=' + lunes)).datos.horas.length, 6); // 8 franjas - 2 citas
    ok('edita el horario desde el admin');

    const { datos: { servicios } } = await admin('GET', '/servicios');
    const s = servicios[0];
    assert.strictEqual((await admin('PUT', '/servicios/' + s.id, Object.assign({}, s, { precio: 'Desde $90.000 al mes' }))).estado, 200);
    const despues = await pedir('GET', '/api/contenido');
    assert.strictEqual(despues.datos.servicios[0].precio, 'Desde $90.000 al mes');
    ok('edita un precio desde el admin');

    const citas = await admin('GET', '/citas?desde=' + lunes + '&hasta=' + lunes);
    assert.strictEqual(citas.datos.citas.length, 2);
    assert.strictEqual((await admin('PATCH', '/citas/' + citas.datos.citas[0].id, { estado: 'confirmada' })).estado, 200);
    ok('confirma una cita');

    console.log(n + ' pruebas correctas.');
  } catch (e) {
    console.error('✗ Falló una prueba:', e.message);
    process.exitCode = 1;
  } finally {
    servidor.kill();
    fs.rmSync(archivo, { force: true });
  }
})();
