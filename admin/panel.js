/* Panel de administrador de SGP Seguros. */
(function () {
  'use strict';
  const A = window.AgendaComun;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MODOS = { presencial: '📍 En persona', llamada: '📞 Llamada', videollamada: '🎥 Videollamada' };
  const ESTADOS = { pendiente: 'Por confirmar', confirmada: 'Confirmada', atendida: 'Atendida', cancelada: 'Cancelada' };

  const estado = { ajustes: {}, hoy: '', ag: { modo: 'semana', ancla: '' }, fotos: [] };

  // ---------- Utilidades ----------
  function el(tag, attrs, hijos) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'texto') n.textContent = v;
      else if (k === 'clase') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    [].concat(hijos || []).forEach((h) => { if (h !== null && h !== undefined && h !== false) n.append(h); });
    return n;
  }

  let tToast;
  function toast(texto, mal) {
    const t = $('#toast');
    t.textContent = texto;
    t.className = 'toast' + (mal ? ' mal' : '');
    t.hidden = false;
    clearTimeout(tToast);
    tToast = setTimeout(() => { t.hidden = true; }, 3500);
  }

  async function api(url, opciones) {
    const o = Object.assign({ headers: {} }, opciones || {});
    if (o.method && o.method !== 'GET') o.headers['X-SGP-Panel'] = '1';
    if (o.json !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.json); }
    const r = await fetch('/api/admin' + url, o);
    if (r.status === 401) { location.href = '/admin/login.html'; throw new Error('Sesión cerrada'); }
    const datos = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(datos.error || 'Ocurrió un error.');
    return datos;
  }

  async function intentar(fn, ok) {
    try { await fn(); if (ok) toast(ok); } catch (e) { if (e.message !== 'Sesión cerrada') toast(e.message, true); }
  }

  function fechaCorta(fecha) {
    const [a, m, d] = fecha.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, d)));
  }

  function enlaceWa(telefono, texto) {
    let d = String(telefono || '').replace(/\D/g, '');
    if (d.length === 10) d = '57' + d;
    return 'https://wa.me/' + d + '?text=' + encodeURIComponent(texto);
  }

  // ---------- Pestañas ----------
  function mostrarVista(nombre) {
    $$('.pestana').forEach((p) => p.setAttribute('aria-selected', String(p.dataset.vista === nombre)));
    $$('main > .vista').forEach((v) => { v.hidden = v.id !== 'vista-' + nombre; });
    ({ agenda: cargarAgenda, mensajes: cargarMensajes, horarios: cargarHorarios, seguros: cargarSeguros, fotos: cargarFotos, ajustes: cargarAjustes })[nombre]();
  }

  // ---------- Resumen y agenda ----------
  async function cargarResumen() {
    const r = await api('/resumen');
    estado.hoy = r.hoy;
    $('#r-hoy').textContent = r.citasHoy;
    $('#r-pend').textContent = r.pendientes;
    $('#r-msj').textContent = r.mensajesSinLeer;
    const cp = $('#cont-pendientes'); cp.textContent = r.pendientes; cp.hidden = !r.pendientes;
    const cm = $('#cont-mensajes'); cm.textContent = r.mensajesSinLeer; cm.hidden = !r.mensajesSinLeer;
  }

  function rangoAgenda() {
    const { modo, ancla } = estado.ag;
    if (modo === 'dia') return [ancla, ancla];
    const lunes = A.sumarDias(ancla, -((A.diaSemana(ancla) + 6) % 7));
    return [lunes, A.sumarDias(lunes, 6)];
  }

  function tarjetaCita(c) {
    const botones = [];
    const cambiar = (nuevo, ok) => el('button', {
      clase: 'btn' + (nuevo === 'confirmada' ? ' btn-ok' : nuevo === 'cancelada' ? ' btn-peligro' : ''), type: 'button',
      texto: ok, onclick: () => intentar(async () => { await api('/citas/' + c.id, { method: 'PATCH', json: { estado: nuevo } }); await cargarAgenda(); }, 'Cita actualizada')
    });
    if (c.estado === 'pendiente') botones.push(cambiar('confirmada', 'Confirmar'));
    if (c.estado === 'pendiente' || c.estado === 'confirmada') botones.push(cambiar('atendida', 'Atendida'), cambiar('cancelada', 'Cancelar'));
    if (c.estado === 'cancelada') botones.push(cambiar('pendiente', 'Reactivar'));
    botones.push(el('a', {
      clase: 'btn btn-wa', target: '_blank', rel: 'noopener', texto: 'WhatsApp',
      href: enlaceWa(c.telefono, 'Hola ' + c.nombre + ', le escribimos de SGP Seguros sobre su cita del ' + fechaCorta(c.fecha) + ' a las ' + A.hora12(c.hora) + '.')
    }));
    return el('article', { clase: 'cita ' + c.estado }, [
      el('div', { clase: 'cita-top' }, [el('span', { clase: 'cita-hora', texto: A.hora12(c.hora) }), el('span', { clase: 'pastilla ' + c.estado, texto: ESTADOS[c.estado] })]),
      el('p', { clase: 'cita-nombre', texto: c.nombre }),
      el('span', { clase: 'modo', texto: MODOS[c.modalidad] || c.modalidad }),
      el('p', { clase: 'cita-info', texto: [c.servicio, c.telefono, c.correo].filter(Boolean).join(' · ') }),
      c.notas ? el('p', { clase: 'cita-info', texto: '“' + c.notas + '”' }) : null,
      el('div', { clase: 'fila-botones' }, botones)
    ]);
  }

  async function cargarAgenda() {
    await cargarResumen();
    if (!estado.ag.ancla) estado.ag.ancla = estado.hoy;
    const [desde, hasta] = rangoAgenda();
    $$('.selector button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === estado.ag.modo)));
    $('#ag-titulo').textContent = desde === hasta ? fechaCorta(desde) : fechaCorta(desde) + ' – ' + fechaCorta(hasta);
    const { citas } = await api('/citas?desde=' + desde + '&hasta=' + hasta);
    const cont = $('#ag-semana');
    cont.className = 'semana' + (estado.ag.modo === 'semana' ? ' vista-semana' : '');
    cont.textContent = '';
    for (let f = desde; f <= hasta; f = A.sumarDias(f, 1)) {
      const delDia = citas.filter((c) => c.fecha === f);
      const activas = delDia.filter((c) => c.estado !== 'cancelada').length;
      cont.append(el('div', { clase: 'dia-col' + (f === estado.hoy ? ' hoy' : '') }, [
        el('h3', {}, [el('span', { texto: fechaCorta(f) }), el('span', { texto: activas ? String(activas) : '' })]),
        delDia.length ? null : el('p', { clase: 'vacio', texto: 'Sin citas' }),
        ...delDia.map(tarjetaCita)
      ]));
    }
  }

  function iniciarAgenda() {
    $$('.selector button').forEach((b) => b.addEventListener('click', () => { estado.ag.modo = b.dataset.modo; cargarAgenda(); }));
    const mover = (signo) => { estado.ag.ancla = A.sumarDias(estado.ag.ancla, signo * (estado.ag.modo === 'dia' ? 1 : 7)); cargarAgenda(); };
    $('#ag-ant').addEventListener('click', () => mover(-1));
    $('#ag-sig').addEventListener('click', () => mover(1));
    $('#ag-hoy').addEventListener('click', () => { estado.ag.ancla = estado.hoy; cargarAgenda(); });
    if (window.matchMedia('(max-width: 1023px)').matches) estado.ag.modo = 'dia';
  }

  // ---------- Mensajes ----------
  async function cargarMensajes() {
    const { mensajes } = await api('/mensajes');
    const lista = $('#lista-mensajes');
    lista.textContent = '';
    if (!mensajes.length) lista.append(el('p', { clase: 'vacio', texto: 'Todavía no hay mensajes.' }));
    mensajes.forEach((m) => {
      const fecha = new Date(String(m.fecha).replace(' ', 'T') + (String(m.fecha).includes('Z') || String(m.fecha).includes('+') ? '' : 'Z'));
      lista.append(el('article', { clase: 'item' + (m.leido ? '' : ' no-leido') }, [
        el('div', { clase: 'item-top' }, [el('b', { texto: m.nombre }), el('span', { clase: 'nota', texto: isNaN(fecha) ? '' : fecha.toLocaleString('es-CO', { timeZone: estado.ajustes.zona || 'America/Bogota' }) })]),
        el('p', { clase: 'nota', texto: [m.telefono, m.correo].filter(Boolean).join(' · ') }),
        el('p', { texto: m.mensaje }),
        el('div', { clase: 'fila-botones' }, [
          el('a', { clase: 'btn btn-wa', target: '_blank', rel: 'noopener', texto: 'Responder por WhatsApp', href: enlaceWa(m.telefono, 'Hola ' + m.nombre + ', le escribimos de SGP Seguros.') }),
          el('button', { clase: 'btn', type: 'button', texto: m.leido ? 'Marcar no leído' : 'Marcar leído',
            onclick: () => intentar(async () => { await api('/mensajes/' + m.id, { method: 'PATCH', json: { leido: !m.leido } }); await cargarMensajes(); await cargarResumen(); }) }),
          el('button', { clase: 'btn btn-peligro', type: 'button', texto: 'Borrar',
            onclick: () => { if (confirm('¿Borrar este mensaje?')) intentar(async () => { await api('/mensajes/' + m.id, { method: 'DELETE' }); await cargarMensajes(); await cargarResumen(); }, 'Mensaje borrado'); } })
        ])
      ]));
    });
  }

  // ---------- Horarios y bloqueos ----------
  function filaBloque(inicio, fin) {
    const fila = el('div', { clase: 'bloque' }, [
      el('input', { type: 'time', step: '900', value: inicio, 'aria-label': 'Desde', 'data-campo': 'inicio' }),
      el('span', { texto: 'a' }),
      el('input', { type: 'time', step: '900', value: fin, 'aria-label': 'Hasta', 'data-campo': 'fin' }),
      el('button', { clase: 'btn btn-peligro', type: 'button', texto: 'Quitar', onclick: () => fila.remove() })
    ]);
    return fila;
  }

  async function cargarHorarios() {
    const [{ horarios }, { ajustes }, { bloqueos }] = await Promise.all([api('/horarios'), api('/ajustes'), api('/bloqueos')]);
    estado.ajustes = ajustes;
    const cont = $('#dias-horario');
    cont.textContent = '';
    [1, 2, 3, 4, 5, 6, 0].forEach((d) => {
      const bloques = el('div', { clase: 'vista', 'data-dia': d });
      horarios.filter((h) => Number(h.dia_semana) === d).forEach((h) => bloques.append(filaBloque(h.hora_inicio, h.hora_fin)));
      cont.append(el('div', { clase: 'dia-horario' }, [
        el('b', { texto: DIAS[d] }),
        bloques,
        el('div', {}, [el('button', { clase: 'btn', type: 'button', texto: '+ Agregar horario', onclick: () => bloques.append(filaBloque('08:00', '12:00')) })])
      ]));
    });
    $('#h-duracion').value = ajustes.duracion;
    $('#h-cupos').value = ajustes.cupos;
    $('#h-anticipacion').value = Number(ajustes.anticipacion) / 60;
    $('#h-dias').value = ajustes.diasMaximos;

    const lista = $('#lista-bloqueos');
    lista.textContent = '';
    if (!bloqueos.length) lista.append(el('p', { clase: 'vacio', texto: 'No hay bloqueos próximos.' }));
    bloqueos.forEach((b) => lista.append(el('div', { clase: 'item' }, [
      el('div', { clase: 'item-top' }, [
        el('b', { texto: fechaCorta(b.fecha) + ' · ' + (b.hora_inicio ? A.hora12(b.hora_inicio) + ' a ' + A.hora12(b.hora_fin) : 'Todo el día') }),
        el('button', { clase: 'btn btn-peligro', type: 'button', texto: 'Quitar', onclick: () => intentar(async () => { await api('/bloqueos/' + b.id, { method: 'DELETE' }); await cargarHorarios(); }, 'Bloqueo quitado') })
      ]),
      b.motivo ? el('p', { clase: 'nota', texto: b.motivo }) : null
    ])));
  }

  function iniciarHorarios() {
    $('#form-horarios').addEventListener('submit', (e) => {
      e.preventDefault();
      const lista = [];
      $$('[data-dia]').forEach((cont) => {
        $$('.bloque', cont).forEach((f) => lista.push({
          dia_semana: Number(cont.dataset.dia),
          hora_inicio: $('[data-campo="inicio"]', f).value,
          hora_fin: $('[data-campo="fin"]', f).value
        }));
      });
      intentar(async () => {
        await api('/horarios', { method: 'PUT', json: { horarios: lista } });
        await api('/ajustes', { method: 'PUT', json: {
          duracion: Number($('#h-duracion').value),
          cupos: Number($('#h-cupos').value),
          anticipacion: Math.round(Number($('#h-anticipacion').value) * 60),
          diasMaximos: Number($('#h-dias').value)
        } });
        await cargarHorarios();
      }, 'Horario guardado');
    });
    $('#b-completo').addEventListener('change', (e) => { $('#b-horas').hidden = e.target.checked; });
    $('#form-bloqueo').addEventListener('submit', (e) => {
      e.preventDefault();
      const completo = $('#b-completo').checked;
      intentar(async () => {
        await api('/bloqueos', { method: 'POST', json: {
          fecha: $('#b-fecha').value,
          hora_inicio: completo ? '' : $('#b-inicio').value,
          hora_fin: completo ? '' : $('#b-fin').value,
          motivo: $('#b-motivo').value
        } });
        e.target.reset(); $('#b-horas').hidden = true;
        await cargarHorarios();
      }, 'Bloqueo guardado');
    });
  }

  // ---------- Seguros ----------
  async function cargarSeguros() {
    const [{ servicios }, { fotos }] = await Promise.all([api('/servicios'), api('/fotos')]);
    estado.fotos = fotos;
    const lista = $('#lista-seguros');
    lista.textContent = '';
    servicios.forEach((s) => lista.append(el('article', { clase: 'item' }, [
      el('div', { clase: 'servicio-fila' }, [
        s.imagen ? el('img', { src: s.imagen, alt: '' }) : el('span'),
        el('div', {}, [
          el('b', { texto: s.nombre + (s.destacado ? ' ★' : '') }),
          el('p', { clase: 'nota', texto: (s.categoria || '') + ' · ' + (s.precio || 'Cotización sin costo') + ' · orden ' + s.orden })
        ])
      ]),
      el('div', { clase: 'fila-botones' }, [
        el('button', { clase: 'btn', type: 'button', texto: 'Editar', onclick: () => abrirFormSeguro(s) }),
        el('button', { clase: 'btn btn-peligro', type: 'button', texto: 'Borrar',
          onclick: () => { if (confirm('¿Borrar "' + s.nombre + '"?')) intentar(async () => { await api('/servicios/' + s.id, { method: 'DELETE' }); await cargarSeguros(); }, 'Seguro borrado'); } })
      ])
    ])));
  }

  function abrirFormSeguro(s) {
    const f = $('#form-seguro');
    s = s || { nombre: '', categoria: 'Personas', descripcion: '', coberturas: [], precio: '', imagen: '', orden: 99, destacado: false };
    $('#titulo-form-seguro').textContent = s.id ? 'Editar seguro' : 'Nuevo seguro';
    $('#s-id').value = s.id || '';
    $('#s-nombre').value = s.nombre;
    $('#s-categoria').value = s.categoria || '';
    $('#s-descripcion').value = s.descripcion || '';
    $('#s-coberturas').value = (s.coberturas || []).join('\n');
    $('#s-precio').value = s.precio || '';
    $('#s-orden').value = s.orden || 0;
    $('#s-destacado').checked = Boolean(s.destacado);
    const sel = $('#s-imagen');
    sel.textContent = '';
    sel.append(el('option', { value: '', texto: 'Sin foto' }));
    const urls = new Set(estado.fotos.map((x) => x.url));
    if (s.imagen && !urls.has(s.imagen)) sel.append(el('option', { value: s.imagen, texto: s.imagen }));
    estado.fotos.forEach((x) => sel.append(el('option', { value: x.url, texto: x.descripcion || x.url })));
    sel.value = s.imagen || '';
    f.hidden = false;
    f.scrollIntoView({ behavior: 'smooth' });
    $('#s-nombre').focus();
  }

  function iniciarSeguros() {
    $('#nuevo-seguro').addEventListener('click', () => abrirFormSeguro());
    $('#cancelar-seguro').addEventListener('click', () => { $('#form-seguro').hidden = true; });
    $('#form-seguro').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#s-id').value;
      const datos = {
        nombre: $('#s-nombre').value, categoria: $('#s-categoria').value, descripcion: $('#s-descripcion').value,
        coberturas: $('#s-coberturas').value, precio: $('#s-precio').value, imagen: $('#s-imagen').value,
        orden: Number($('#s-orden').value), destacado: $('#s-destacado').checked
      };
      intentar(async () => {
        await api(id ? '/servicios/' + id : '/servicios', { method: id ? 'PUT' : 'POST', json: datos });
        $('#form-seguro').hidden = true;
        await cargarSeguros();
      }, 'Seguro guardado');
    });
  }

  // ---------- Fotos ----------
  async function cargarFotos() {
    const { fotos, nube } = await api('/fotos');
    estado.fotos = fotos;
    $('#aviso-nube').hidden = nube;
    const lista = $('#lista-fotos');
    lista.textContent = '';
    fotos.forEach((f) => {
      const desc = el('input', { value: f.descripcion || '', maxlength: '200', 'aria-label': 'Descripción' });
      const orden = el('input', { type: 'number', value: f.orden, 'aria-label': 'Orden' });
      lista.append(el('article', { clase: 'item' }, [
        el('img', { src: f.url, alt: f.descripcion || '', loading: 'lazy' }),
        el('label', { clase: 'campo' }, [el('span', { texto: 'Descripción' }), desc]),
        el('label', { clase: 'campo' }, [el('span', { texto: 'Orden' }), orden]),
        el('div', { clase: 'fila-botones' }, [
          el('button', { clase: 'btn btn-ok', type: 'button', texto: 'Guardar', onclick: () => intentar(async () => { await api('/fotos/' + f.id, { method: 'PUT', json: { descripcion: desc.value, orden: Number(orden.value) } }); await cargarFotos(); }, 'Foto actualizada') }),
          el('button', { clase: 'btn btn-peligro', type: 'button', texto: 'Borrar', onclick: () => { if (confirm('¿Quitar esta foto de la galería?')) intentar(async () => { await api('/fotos/' + f.id, { method: 'DELETE' }); await cargarFotos(); }, 'Foto quitada'); } })
        ])
      ]));
    });
  }

  function iniciarFotos() {
    $('#form-foto').addEventListener('submit', (e) => {
      e.preventDefault();
      const archivo = $('#f-archivo').files[0];
      if (!archivo) { toast('Elija una imagen.', true); return; }
      const datos = new FormData();
      datos.append('foto', archivo);
      datos.append('descripcion', $('#f-descripcion').value);
      intentar(async () => {
        await api('/fotos', { method: 'POST', body: datos });
        e.target.reset();
        await cargarFotos();
      }, 'Foto subida');
    });
  }

  // ---------- Ajustes ----------
  const CAMPOS = { nombre: 'a-nombre', eslogan: 'a-eslogan', whatsapp: 'a-whatsapp', ciudad: 'a-ciudad', mensajeWhatsapp: 'a-mensaje', direccion: 'a-direccion', horarioTexto: 'a-horario', correoAvisos: 'a-correo-avisos', correoPublico: 'a-correo-publico', facebook: 'a-facebook', instagram: 'a-instagram' };

  async function cargarAjustes() {
    const { ajustes } = await api('/ajustes');
    estado.ajustes = ajustes;
    Object.entries(CAMPOS).forEach(([k, id]) => { $('#' + id).value = ajustes[k] || ''; });
    ['presencial', 'llamada', 'videollamada'].forEach((m) => { $('#m-' + m).checked = (ajustes.modalidades || []).includes(m); });
  }

  function iniciarAjustes() {
    $('#form-ajustes').addEventListener('submit', (e) => {
      e.preventDefault();
      const datos = {};
      Object.entries(CAMPOS).forEach(([k, id]) => { datos[k] = $('#' + id).value; });
      datos.modalidades = ['presencial', 'llamada', 'videollamada'].filter((m) => $('#m-' + m).checked);
      intentar(async () => { await api('/ajustes', { method: 'PUT', json: datos }); await cargarAjustes(); }, 'Datos guardados');
    });
    $('#form-clave').addEventListener('submit', (e) => {
      e.preventDefault();
      intentar(async () => {
        await api('/clave', { method: 'POST', json: { actual: $('#k-actual').value, nueva: $('#k-nueva').value } });
        e.target.reset();
      }, 'Clave cambiada');
    });
  }

  // ---------- Arranque ----------
  async function iniciar() {
    try { await api('/yo'); } catch (e) { return; }
    $$('.pestana').forEach((p) => p.addEventListener('click', () => intentar(() => mostrarVista(p.dataset.vista))));
    $('#salir').addEventListener('click', async () => { await api('/logout', { method: 'POST' }).catch(() => {}); location.href = '/admin/login.html'; });
    iniciarAgenda(); iniciarHorarios(); iniciarSeguros(); iniciarFotos(); iniciarAjustes();
    estado.ajustes = (await api('/ajustes')).ajustes;
    intentar(cargarAgenda);
  }
  iniciar();
})();
