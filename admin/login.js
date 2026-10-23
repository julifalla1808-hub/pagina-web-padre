document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('error');
  error.hidden = true;
  const boton = e.target.querySelector('button');
  boton.disabled = true;
  try {
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: e.target.usuario.value, clave: e.target.clave.value })
    });
    const datos = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(datos.error || 'No se pudo iniciar sesión.');
    location.href = '/admin/';
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
  } finally {
    boton.disabled = false;
  }
});
