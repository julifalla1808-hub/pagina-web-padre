
(function (raiz, fabrica) {
if (typeof module === 'object' && module.exports) module.exports = fabrica();
else raiz.AgendaComun = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function aMinutos(hora) {
const [h, m] = String(hora).slice(0, 5).split(':').map(Number);
return h * 60 + m;
}
function aHora(minutos) {
const h = Math.floor(minutos / 60);
const m = minutos % 60;
return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function hora12(hora) {
const total = aMinutos(hora);
const h = Math.floor(total / 60);
const m = total % 60;
const sufijo = h < 12 ? 'a. m.' : 'p. m.';
return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + sufijo;
}
function esFechaValida(fecha) {
if (!FECHA_RE.test(fecha || '')) return false;
const [a, m, d] = fecha.split('-').map(Number);
const f = new Date(Date.UTC(a, m - 1, d));
return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}
function esHoraValida(hora) {
return HORA_RE.test(hora || '');
}
function diaSemana(fecha) {
const [a, m, d] = fecha.split('-').map(Number);
return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}
function sumarDias(fecha, dias) {
const [a, m, d] = fecha.split('-').map(Number);
const f = new Date(Date.UTC(a, m - 1, d + dias));
return f.toISOString().slice(0, 10);
}
function diasEntre(desde, hasta) {
const [a1, m1, d1] = desde.split('-').map(Number);
const [a2, m2, d2] = hasta.split('-').map(Number);
return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}
function ahoraEnZona(zona, fechaReal) {
const partes = new Intl.DateTimeFormat('en-CA', {
timeZone: zona || 'America/Bogota',
year: 'numeric', month: '2-digit', day: '2-digit',
hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
}).formatToParts(fechaReal || new Date());
const p = {};
partes.forEach((x) => { p[x.type] = x.value; });
return {
fecha: p.year + '-' + p.month + '-' + p.day,
minutos: Number(p.hour) * 60 + Number(p.minute)
};
}
function seCruzan(inicioA, finA, inicioB, finB) {
return inicioA < finB && inicioB < finA;
}
function horasLibres(datos) {
const { fecha, ahora } = datos;
const aj = datos.ajustes || {};
const duracion = Math.max(10, Number(aj.duracion) || 30);
const cupos = Math.max(1, Number(aj.cupos) || 1);
const anticipacion = Math.max(0, Number(aj.anticipacion) || 0);
const diasMaximos = Math.max(1, Number(aj.diasMaximos) || 60);
if (!esFechaValida(fecha)) return [];
const distancia = diasEntre(ahora.fecha, fecha);
if (distancia < 0 || distancia > diasMaximos) return [];
const dia = diaSemana(fecha);
const bloques = (datos.horarios || []).filter(
(h) => Number(h.dia_semana) === dia && (h.activo === undefined || h.activo === true || h.activo === 1 || h.activo === '1')
);
const bloqueosDia = (datos.bloqueos || []).filter((b) => b.fecha === fecha);
if (bloqueosDia.some((b) => !b.hora_inicio)) return []; // día completo bloqueado
const citasDia = (datos.citas || []).filter(
(c) => c.fecha === fecha && c.estado !== 'cancelada'
);
const minimo = distancia === 0 ? ahora.minutos + anticipacion : -1;
const resultado = [];
const vistas = new Set();
bloques
.slice()
.sort((a, b) => aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio))
.forEach((bloque) => {
const fin = aMinutos(bloque.hora_fin);
for (let t = aMinutos(bloque.hora_inicio); t + duracion <= fin; t += duracion) {
if (vistas.has(t)) continue;
vistas.add(t);
if (t < minimo) continue;
const bloqueada = bloqueosDia.some((b) =>
seCruzan(t, t + duracion, aMinutos(b.hora_inicio), aMinutos(b.hora_fin || '23:59'))
);
if (bloqueada) continue;
const ocupadas = citasDia.filter((c) => {
const inicio = aMinutos(c.hora);
return seCruzan(t, t + duracion, inicio, inicio + (Number(c.duracion) || duracion));
}).length;
const libres = cupos - ocupadas;
if (libres > 0) resultado.push({ hora: aHora(t), libres });
}
});
return resultado.sort((a, b) => aMinutos(a.hora) - aMinutos(b.hora));
}
function diasDisponibles(mes, datos) {
if (!/^\d{4}-\d{2}$/.test(mes || '')) return [];
const [a, m] = mes.split('-').map(Number);
const total = new Date(Date.UTC(a, m, 0)).getUTCDate();
const dias = [];
for (let d = 1; d <= total; d++) {
const fecha = mes + '-' + String(d).padStart(2, '0');
const horas = horasLibres(Object.assign({}, datos, { fecha }));
if (horas.length) dias.push(fecha);
}
return dias;
}
return {
aMinutos, aHora, hora12, esFechaValida, esHoraValida, diaSemana,
sumarDias, diasEntre, ahoraEnZona, horasLibres, diasDisponibles
};
});
