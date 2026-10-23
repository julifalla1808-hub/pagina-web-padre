// Validaciones sencillas de los datos que llegan al servidor.
function texto(valor, { min = 0, max = 500, requerido = false } = {}) {
  const v = typeof valor === 'string' ? valor.trim() : '';
  if (requerido && v.length < Math.max(1, min)) return { error: true };
  if (v.length > max) return { error: true };
  return { valor: v };
}

function telefono(valor) {
  const v = String(valor || '').replace(/[^\d+]/g, '');
  const digitos = v.replace(/\D/g, '');
  if (digitos.length < 7 || digitos.length > 15) return { error: true };
  return { valor: v };
}

function correo(valor, requerido = false) {
  const v = String(valor || '').trim();
  if (!v) return requerido ? { error: true } : { valor: '' };
  if (v.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { error: true };
  return { valor: v };
}

function entero(valor, min, max) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) return { error: true };
  return { valor: n };
}

module.exports = { texto, telefono, correo, entero };
