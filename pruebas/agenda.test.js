// Pruebas de la lógica de la agenda (no necesitan base de datos).
// Ejecutar: node pruebas/agenda.test.js
const assert = require('assert');
const A = require('../public/js/agenda-comun.js');

const horarios = [1, 2, 3, 4, 5, 6].map((d) => ({ dia_semana: d, hora_inicio: '08:00', hora_fin: '18:00', activo: 1 }));
const ajustes = { duracion: 30, cupos: 1, anticipacion: 120, diasMaximos: 60 };
const ahora = { fecha: '2026-10-23', minutos: 10 * 60 }; // viernes 10:00 a. m.
const base = { horarios, bloqueos: [], citas: [], ajustes, ahora };
let n = 0;
const prueba = (nombre, fn) => { fn(); n++; console.log('  ✓ ' + nombre); };

console.log('Agenda');
prueba('lunes a sábado de 8 a 6 con citas de 30 min = 20 horas', () => {
  assert.strictEqual(A.horasLibres({ ...base, fecha: '2026-10-26' }).length, 20);
});
prueba('domingo no tiene horas', () => {
  assert.strictEqual(A.horasLibres({ ...base, fecha: '2026-10-25' }).length, 0);
});
prueba('hoy oculta horas pasadas y respeta 2 horas de anticipación', () => {
  const horas = A.horasLibres({ ...base, fecha: '2026-10-23' });
  assert.strictEqual(horas[0].hora, '12:00');
});
prueba('fechas pasadas y demasiado lejanas no tienen horas', () => {
  assert.strictEqual(A.horasLibres({ ...base, fecha: '2026-10-22' }).length, 0);
  assert.strictEqual(A.horasLibres({ ...base, fecha: '2027-03-01' }).length, 0);
});
prueba('una franja llena (1 cupo) desaparece', () => {
  const citas = [{ fecha: '2026-10-26', hora: '09:00', duracion: 30, estado: 'pendiente' }];
  const horas = A.horasLibres({ ...base, citas, fecha: '2026-10-26' }).map((h) => h.hora);
  assert.ok(!horas.includes('09:00'));
  assert.ok(horas.includes('09:30'));
});
prueba('con 3 cupos, la franja sigue libre hasta la tercera cita', () => {
  const citas = [1, 2].map(() => ({ fecha: '2026-10-26', hora: '09:00', duracion: 30, estado: 'confirmada' }));
  const aj3 = { ...ajustes, cupos: 3 };
  const h = A.horasLibres({ ...base, ajustes: aj3, citas, fecha: '2026-10-26' }).find((x) => x.hora === '09:00');
  assert.strictEqual(h.libres, 1);
  citas.push({ fecha: '2026-10-26', hora: '09:00', duracion: 30, estado: 'pendiente' });
  assert.ok(!A.horasLibres({ ...base, ajustes: aj3, citas, fecha: '2026-10-26' }).some((x) => x.hora === '09:00'));
});
prueba('las citas canceladas liberan el cupo', () => {
  const citas = [{ fecha: '2026-10-26', hora: '09:00', duracion: 30, estado: 'cancelada' }];
  assert.ok(A.horasLibres({ ...base, citas, fecha: '2026-10-26' }).some((h) => h.hora === '09:00'));
});
prueba('bloqueo de día completo y de algunas horas', () => {
  assert.strictEqual(A.horasLibres({ ...base, bloqueos: [{ fecha: '2026-10-26', hora_inicio: null }], fecha: '2026-10-26' }).length, 0);
  const horas = A.horasLibres({ ...base, bloqueos: [{ fecha: '2026-10-26', hora_inicio: '12:00', hora_fin: '14:00' }], fecha: '2026-10-26' }).map((h) => h.hora);
  assert.ok(!horas.includes('12:00') && !horas.includes('13:30') && horas.includes('14:00'));
});
prueba('varios bloques en un día (8–12 y 14–18)', () => {
  const dos = [{ dia_semana: 1, hora_inicio: '08:00', hora_fin: '12:00' }, { dia_semana: 1, hora_inicio: '14:00', hora_fin: '18:00' }];
  const horas = A.horasLibres({ ...base, horarios: dos, fecha: '2026-10-26' }).map((h) => h.hora);
  assert.strictEqual(horas.length, 16);
  assert.ok(!horas.includes('12:30'));
});
prueba('días disponibles del mes', () => {
  const dias = A.diasDisponibles('2026-11', base);
  assert.ok(!dias.includes('2026-11-01')); // domingo
  assert.ok(dias.includes('2026-11-02'));
});
prueba('formato de 12 horas', () => {
  assert.strictEqual(A.hora12('15:30'), '3:30 p. m.');
  assert.strictEqual(A.hora12('08:00'), '8:00 a. m.');
  assert.strictEqual(A.hora12('12:00'), '12:00 p. m.');
});
prueba('validación de fechas', () => {
  assert.ok(A.esFechaValida('2026-02-28'));
  assert.ok(!A.esFechaValida('2026-02-30'));
  assert.ok(!A.esFechaValida('hola'));
});
console.log(n + ' pruebas correctas.');
