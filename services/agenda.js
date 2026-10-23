// Cálculo de horarios disponibles, usando la misma lógica que el navegador.
const comun = require('../public/js/agenda-comun.js');
const { db, leerAjustes } = require('../db');

async function datosAgenda(conexion, desde, hasta) {
  const cx = conexion || db;
  const [horarios, bloqueos, citas, ajustes] = await Promise.all([
    cx('horarios').select('dia_semana', 'hora_inicio', 'hora_fin', 'activo'),
    cx('bloqueos').whereBetween('fecha', [desde, hasta]).select('fecha', 'hora_inicio', 'hora_fin'),
    cx('citas').whereBetween('fecha', [desde, hasta]).whereNot('estado', 'cancelada')
      .select('fecha', 'hora', 'duracion', 'estado'),
    leerAjustes(cx)
  ]);
  return {
    horarios,
    bloqueos,
    citas,
    ajustes,
    ahora: comun.ahoraEnZona(ajustes.zona)
  };
}

async function horasDelDia(fecha, conexion) {
  const datos = await datosAgenda(conexion, fecha, fecha);
  return { horas: comun.horasLibres(Object.assign({}, datos, { fecha })), ajustes: datos.ajustes };
}

async function diasDelMes(mes) {
  const [a, m] = mes.split('-').map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const datos = await datosAgenda(null, mes + '-01', mes + '-' + String(ultimo).padStart(2, '0'));
  return comun.diasDisponibles(mes, datos);
}

module.exports = Object.assign({}, comun, { horasDelDia, diasDelMes });
