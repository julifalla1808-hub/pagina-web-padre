/* SGP Seguros — sitio público.
 * Todo el contenido (seguros, fotos, datos) llega del servidor (/api/contenido),
 * así el dueño lo cambia desde el panel sin tocar código.
 * Si existe window.SGP_VISTA_PREVIA, la página funciona sin servidor (solo para mostrar el diseño).
 */
(function () {
  'use strict';

  const A = window.AgendaComun;
  const VISTA = window.SGP_VISTA_PREVIA || null;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const estado = {
    ajustes: {},
    servicios: [],
    agenda: { servicio: '', modalidad: '', fecha: '', hora: '', mes: '', hoy: '', mesMax: '' }
  };

  const MODALIDADES = {
    presencial: { nombre: 'En persona', icono: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>' },
    llamada: { nombre: 'Llamada', icono: '<path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2.1-2.2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' },
    videollamada: { nombre: 'Videollamada', icono: '<rect x="3" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 10.5l6-3.5v10l-6-3.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' }
  };

  const DESCRIPCION_PLAN = {
    'Personas': 'Para usted y su vehículo, en cada trayecto.',
    'Hogar y familia': 'Para su vivienda, sus bienes y los suyos.',
    'Empresas': 'Para la continuidad de su negocio.'
  };

  // ---------- Utilidades ----------
  function el(etiqueta, atributos, hijos) {
    const nodo = document.createElement(etiqueta);
    Object.entries(atributos || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'texto') nodo.textContent = v;
      else if (k === 'clase') nodo.className = v;
      else if (k.startsWith('on')) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v === true ? '' : v);
    });
    [].concat(hijos || []).forEach((h) => { if (h) nodo.append(h); });
    return nodo;
  }

  function svgIcono(contenido) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = contenido; // contenido fijo definido arriba, nunca datos del usuario
    return s;
  }

  function iconoWa() {
    return svgIcono('<use href="#icono-wa"/>');
  }

  function enlaceWa(texto) {
    const numero = String(estado.ajustes.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto || estado.ajustes.mensajeWhatsapp || '');
  }

  function numeroVisible(n) {
    const d = String(n || '').replace(/\D/g, '');
    const local = d.length > 10 && d.startsWith('57') ? d.slice(2) : d;
    return local.length === 10 ? local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6) : local;
  }

  function fechaLarga(fecha) {
    const [a, m, d] = fecha.split('-').map(Number);
    const t = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(a, m - 1, d)));
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function nombreMes(mes) {
    const [a, m] = mes.split('-').map(Number);
    const t = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, 1)));
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function moverMes(mes, delta) {
    const [a, m] = mes.split('-').map(Number);
    const f = new Date(Date.UTC(a, m - 1 + delta, 1));
    return f.toISOString().slice(0, 7);
  }

  let temporizadorAviso;
  function aviso(texto) {
    const caja = $('#aviso');
    caja.textContent = texto;
    caja.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => { caja.hidden = true; }, 6000);
  }

  // ---------- Conexión con el servidor (o vista previa) ----------
  const citasVistaPrevia = [];

  function datosVistaPrevia() {
    return {
      horarios: VISTA.horarios,
      bloqueos: [],
      citas: citasVistaPrevia,
      ajustes: Object.assign({ cupos: 1, anticipacion: 120 }, VISTA.ajustes),
      ahora: A.ahoraEnZona(VISTA.ajustes.zona)
    };
  }

  async function pedir(url, opciones) {
    const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opciones));
    let datos = {};
    try { datos = await r.json(); } catch (e) { /* respuesta vacía */ }
    if (!r.ok) {
      const error = new Error(datos.error || 'No pudimos conectar con el servidor.');
      error.estado = r.status;
      throw error;
    }
    return datos;
  }

  const api = {
    contenido: () => (VISTA ? Promise.resolve(VISTA) : pedir('/api/contenido')),
    dias: (mes) => (VISTA ? Promise.resolve({ dias: A.diasDisponibles(mes, datosVistaPrevia()) }) : pedir('/api/agenda/dias?mes=' + mes)),
    horas: (fecha) => (VISTA ? Promise.resolve({ horas: A.horasLibres(Object.assign(datosVistaPrevia(), { fecha })) }) : pedir('/api/agenda/horas?fecha=' + fecha)),
    mensaje: (datos) => (VISTA ? Promise.resolve({ ok: true, vista: true }) : pedir('/api/mensajes', { method: 'POST', body: JSON.stringify(datos) })),
    cita: (datos) => {
      if (!VISTA) return pedir('/api/citas', { method: 'POST', body: JSON.stringify(datos) });
      const libre = A.horasLibres(Object.assign(datosVistaPrevia(), { fecha: datos.fecha })).some((h) => h.hora === datos.hora);
      if (!libre) return Promise.reject(new Error('Esa hora ya no está disponible. Por favor elija otra.'));
      citasVistaPrevia.push({ fecha: datos.fecha, hora: datos.hora, duracion: VISTA.ajustes.duracion, estado: 'pendiente' });
      return Promise.resolve({ ok: true, vista: true, cita: datos });
    }
  };

  // ---------- Pintar contenido ----------
  function pintarAjustes() {
    const a = estado.ajustes;
    const valores = Object.assign({}, a, {
      nombreMayus: String(a.nombre || '').toUpperCase(),
      whatsappVisible: numeroVisible(a.whatsapp)
    });
    $$('[data-ajuste]').forEach((nodo) => {
      const v = valores[nodo.dataset.ajuste];
      if (v) nodo.textContent = v;
    });
    $$('[data-wa]').forEach((a2) => { a2.href = enlaceWa(); });
    $('#anio').textContent = new Date().getFullYear();

    const redes = $('#redes');
    redes.textContent = '';
    [['facebook', 'Facebook'], ['instagram', 'Instagram']].forEach(([k, nombre]) => {
      if (a[k] && /^https:\/\//.test(a[k])) redes.append(el('a', { href: a[k], target: '_blank', rel: 'noopener', texto: nombre }));
    });
  }

  function listaChecks(items) {
    return el('ul', { clase: 'checks' }, items.map((c) => el('li', { texto: c })));
  }

  function pintarSeguros() {
    const lista = $('#lista-seguros');
    lista.textContent = '';
    estado.servicios.forEach((s) => {
      lista.append(el('article', { clase: 'seguro' }, [
        el('div', { clase: 'seguro-foto' }, [
          s.imagen ? el('img', { src: s.imagen, alt: s.nombre, loading: 'lazy', width: '640', height: '360' }) : null,
          s.categoria ? el('span', { clase: 'seguro-cat', texto: s.categoria }) : null
        ]),
        el('div', { clase: 'seguro-cuerpo' }, [
          el('h3', { texto: s.nombre }),
          s.descripcion ? el('p', { texto: s.descripcion }) : null,
          s.coberturas && s.coberturas.length ? listaChecks(s.coberturas) : null,
          el('div', { clase: 'seguro-pie' }, [
            el('a', {
              clase: 'boton boton-wa', target: '_blank', rel: 'noopener',
              href: enlaceWa('Hola SGP Seguros, quiero cotizar el ' + s.nombre + '.')
            }, [iconoWa(), document.createTextNode('Cotizar')]),
            el('button', { clase: 'enlace-flecha', type: 'button', 'data-agendar': s.nombre, texto: 'Agendar asesoría' })
          ])
        ])
      ]));
    });
  }

  function pintarPlanes() {
    const grupos = new Map();
    estado.servicios.forEach((s) => {
      const cat = s.categoria || 'Otros';
      if (!grupos.has(cat)) grupos.set(cat, []);
      grupos.get(cat).push(s);
    });
    const lista = $('#lista-planes');
    lista.textContent = '';
    grupos.forEach((servicios, cat) => {
      const destacado = servicios.some((s) => s.destacado);
      const precios = servicios.map((s) => s.precio).filter(Boolean);
      lista.append(el('article', { clase: 'plan' + (destacado ? ' plan-destacado' : '') }, [
        destacado ? el('span', { clase: 'plan-sello', texto: 'Más solicitado' }) : null,
        el('h3', { texto: cat }),
        DESCRIPCION_PLAN[cat] ? el('p', { clase: 'plan-para', texto: DESCRIPCION_PLAN[cat] }) : null,
        el('p', { clase: 'plan-precio' }, precios.length
          ? [document.createTextNode(precios[0]), el('small', { texto: 'Valor de referencia; depende de la cotización' })]
          : [document.createTextNode('Cotización sin costo'), el('small', { texto: 'Planes ajustados a sus necesidades' })]),
        el('ul', {}, servicios.map((s) => el('li', { texto: s.nombre }))),
        el('div', { clase: 'acciones' }, [
          el('a', {
            clase: 'boton boton-wa', target: '_blank', rel: 'noopener',
            href: enlaceWa('Hola SGP Seguros, quiero cotizar un plan de ' + cat.toLowerCase() + '.')
          }, [iconoWa(), document.createTextNode('Cotizar plan')]),
          el('button', { clase: 'boton boton-borde', type: 'button', 'data-agendar': servicios[0].nombre, texto: 'Agendar' })
        ])
      ]));
    });
  }

  function pintarGaleria(fotos) {
    const lista = $('#lista-fotos');
    lista.textContent = '';
    // Cuántas fotos grandes (2×2) hacen que el mosaico de 4 columnas quede completo
    const n = fotos.length;
    let grandes = 0;
    for (let g = 0; g <= 3 && g <= n; g++) { if ((n + 3 * g) % 4 === 0) { grandes = g; break; } }
    const posicionesGrandes = new Set([0, 6, 3].slice(0, grandes));
    fotos.forEach((f, i) => {
      lista.append(el('button', {
        clase: 'foto' + (posicionesGrandes.has(i) ? ' grande' : ''), type: 'button',
        'aria-label': 'Ampliar foto: ' + (f.descripcion || 'SGP Seguros'),
        onclick: () => abrirVisor(f)
      }, [
        el('img', { src: f.url, alt: f.descripcion || '', loading: 'lazy', width: '600', height: '450' }),
        f.descripcion ? el('span', { texto: f.descripcion }) : null
      ]));
    });
  }

  function abrirVisor(foto) {
    const visor = $('#visor');
    $('#visor-img').src = foto.url;
    $('#visor-img').alt = foto.descripcion || '';
    $('#visor-texto').textContent = foto.descripcion || '';
    if (typeof visor.showModal === 'function') visor.showModal();
    else visor.setAttribute('open', '');
  }

  // ---------- Menú ----------
  function iniciarMenu() {
    const boton = $('#boton-menu');
    const menu = $('#menu');
    const cerrar = () => { menu.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); };
    boton.addEventListener('click', () => {
      const abrir = !menu.classList.contains('abierto');
      menu.classList.toggle('abierto', abrir);
      boton.setAttribute('aria-expanded', String(abrir));
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });

    const visor = $('#visor');
    $('#visor-cerrar').addEventListener('click', () => visor.close ? visor.close() : visor.removeAttribute('open'));
    visor.addEventListener('click', (e) => { if (e.target === visor && visor.close) visor.close(); });
  }

  // ---------- Agenda ----------
  function pintarOpcionesAgenda() {
    const select = $('#cita-servicio');
    select.textContent = '';
    select.append(el('option', { value: '', texto: 'Elija un seguro…' }));
    estado.servicios.forEach((s) => select.append(el('option', { value: s.nombre, texto: s.nombre })));
    select.append(el('option', { value: 'Asesoría general', texto: 'Asesoría general / otro' }));

    const cont = $('#opciones-modalidad');
    cont.textContent = '';
    const activas = (estado.ajustes.modalidades || []).filter((m) => MODALIDADES[m]);
    activas.forEach((m) => {
      cont.append(el('button', {
        clase: 'modalidad', type: 'button', role: 'radio', 'aria-checked': 'false', 'data-modalidad': m,
        onclick: () => elegirModalidad(m)
      }, [svgIcono(MODALIDADES[m].icono), document.createTextNode(MODALIDADES[m].nombre)]));
    });
    if (activas.length === 1) elegirModalidad(activas[0]);
  }

  function textoLugar(modalidad) {
    const a = estado.ajustes;
    if (modalidad === 'presencial') {
      return a.direccion
        ? 'Lo esperamos en: ' + a.direccion + ', ' + a.ciudad + '.'
        : 'Cita en ' + (a.ciudad || 'nuestra oficina') + '. Le confirmaremos la dirección por WhatsApp.';
    }
    if (modalidad === 'llamada') return 'Le llamaremos al celular que nos deje.';
    return 'Le enviaremos el enlace de la videollamada por WhatsApp o correo.';
  }

  function elegirModalidad(m) {
    estado.agenda.modalidad = m;
    $$('.modalidad').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.modalidad === m)));
    const nota = $('#nota-lugar');
    nota.textContent = textoLugar(m);
    nota.hidden = false;
    actualizarResumen();
  }

  async function pintarCalendario() {
    const ag = estado.agenda;
    $('#mes-titulo').textContent = nombreMes(ag.mes);
    $('#mes-anterior').disabled = ag.mes <= ag.hoy.slice(0, 7);
    $('#mes-siguiente').disabled = ag.mes >= ag.mesMax;
    const cont = $('#cal-dias');
    cont.setAttribute('aria-busy', 'true');

    let libres = [];
    try {
      libres = (await api.dias(ag.mes)).dias || [];
    } catch (e) {
      $('#horas-ayuda').textContent = 'No pudimos cargar la agenda. Escríbanos por WhatsApp para agendar.';
    }
    const disponibles = new Set(libres);
    const [a, m] = ag.mes.split('-').map(Number);
    const total = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const desfase = (new Date(Date.UTC(a, m - 1, 1)).getUTCDay() + 6) % 7; // lunes primero

    cont.textContent = '';
    for (let i = 0; i < desfase; i++) cont.append(el('span', { 'aria-hidden': 'true' }));
    for (let d = 1; d <= total; d++) {
      const fecha = ag.mes + '-' + String(d).padStart(2, '0');
      const libre = disponibles.has(fecha);
      cont.append(el('button', {
        type: 'button',
        clase: 'dia' + (libre ? ' libre' : '') + (fecha === ag.hoy ? ' hoy' : ''),
        disabled: !libre,
        'aria-selected': String(fecha === ag.fecha),
        'aria-label': fechaLarga(fecha) + (libre ? ', con horas libres' : ', sin cupo'),
        texto: String(d),
        onclick: () => elegirDia(fecha)
      }));
    }
    cont.removeAttribute('aria-busy');
  }

  async function elegirDia(fecha) {
    estado.agenda.fecha = fecha;
    estado.agenda.hora = '';
    $$('.dia').forEach((b) => b.setAttribute('aria-selected', 'false'));
    const boton = $$('.dia').find((b) => b.getAttribute('aria-label').startsWith(fechaLarga(fecha)));
    if (boton) boton.setAttribute('aria-selected', 'true');
    $('#datos-cita').hidden = true;
    await pintarHoras();
    if (window.matchMedia('(max-width: 1023px)').matches) $('#horas-ayuda').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function pintarHoras() {
    const cont = $('#horas');
    const ayuda = $('#horas-ayuda');
    cont.textContent = '';
    ayuda.textContent = 'Buscando horas libres…';
    let horas = [];
    try {
      horas = (await api.horas(estado.agenda.fecha)).horas || [];
    } catch (e) {
      ayuda.textContent = 'No pudimos cargar las horas. Intente de nuevo o escríbanos por WhatsApp.';
      return;
    }
    if (!horas.length) {
      ayuda.textContent = 'Ese día ya no tiene horas libres. Elija otro día.';
      return;
    }
    ayuda.textContent = fechaLarga(estado.agenda.fecha) + ': elija una hora.';
    const manana = horas.filter((h) => A.aMinutos(h.hora) < 720);
    const tarde = horas.filter((h) => A.aMinutos(h.hora) >= 720);
    [['Mañana', manana], ['Tarde', tarde]].forEach(([titulo, lista]) => {
      if (!lista.length) return;
      cont.append(el('p', { clase: 'horas-grupo', texto: titulo }));
      lista.forEach((h) => cont.append(el('button', {
        clase: 'hora', type: 'button', role: 'radio', 'aria-checked': 'false', 'data-hora': h.hora,
        texto: A.hora12(h.hora), onclick: () => elegirHora(h.hora)
      })));
    });
  }

  function elegirHora(hora) {
    estado.agenda.hora = hora;
    $$('.hora').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.hora === hora)));
    $('#datos-cita').hidden = false;
    $('#cita-error').hidden = true;
    actualizarResumen();
  }

  function actualizarResumen() {
    const ag = estado.agenda;
    const caja = $('#resumen-elegido');
    if (!caja || !ag.fecha || !ag.hora) return;
    caja.textContent = '';
    caja.append('Cita: ', el('b', { texto: fechaLarga(ag.fecha) + ', ' + A.hora12(ag.hora) }));
    if (ag.modalidad) caja.append(' · ', el('b', { texto: MODALIDADES[ag.modalidad].nombre }));
  }

  function mostrarErrorCita(texto) {
    const e = $('#cita-error');
    e.textContent = texto;
    e.hidden = false;
  }

  async function enviarCita(evento) {
    evento.preventDefault();
    const ag = estado.agenda;
    const form = evento.target;
    const datos = {
      servicio: $('#cita-servicio').value,
      modalidad: ag.modalidad,
      fecha: ag.fecha,
      hora: ag.hora,
      nombre: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      correo: form.correo.value.trim(),
      notas: form.notas.value.trim(),
      sitio_web: form.sitio_web.value
    };
    if (!datos.servicio) { mostrarErrorCita('Elija el seguro que le interesa (paso 1).'); $('#cita-servicio').focus(); return; }
    if (!datos.modalidad) { mostrarErrorCita('Elija cómo prefiere la cita (paso 2).'); return; }
    if (!datos.fecha || !datos.hora) { mostrarErrorCita('Elija el día y la hora.'); return; }
    if (datos.nombre.length < 2) { mostrarErrorCita('Escriba su nombre.'); form.nombre.focus(); return; }
    if (datos.telefono.replace(/\D/g, '').length < 7) { mostrarErrorCita('Escriba un celular válido.'); form.telefono.focus(); return; }

    const boton = $('#cita-enviar');
    boton.disabled = true;
    boton.textContent = 'Agendando…';
    try {
      const r = await api.cita(datos);
      mostrarConfirmacion(datos);
      if (r.vista) aviso('Vista previa: en el sitio publicado esta cita se guarda y llega un aviso a ' + (estado.ajustes.correoPublico || 'su correo') + '.');
    } catch (e) {
      mostrarErrorCita(e.message);
      if (e.estado === 409) { await pintarCalendario(); await pintarHoras(); $('#datos-cita').hidden = true; }
    } finally {
      boton.disabled = false;
      boton.textContent = 'Agendar cita';
    }
  }

  function mostrarConfirmacion(datos) {
    const dl = $('#confirmacion-detalle');
    dl.textContent = '';
    [
      ['Fecha', fechaLarga(datos.fecha)],
      ['Hora', A.hora12(datos.hora)],
      ['Modalidad', MODALIDADES[datos.modalidad].nombre],
      ['Lugar', textoLugar(datos.modalidad)],
      ['Seguro', datos.servicio]
    ].forEach(([k, v]) => dl.append(el('div', {}, [el('dt', { texto: k }), el('dd', { texto: v })])));
    $('#confirmacion-wa').href = enlaceWa(
      'Hola SGP Seguros, soy ' + datos.nombre + '. Agendé una cita (' + MODALIDADES[datos.modalidad].nombre.toLowerCase() + ') para el ' +
      fechaLarga(datos.fecha).toLowerCase() + ' a las ' + A.hora12(datos.hora) + ' sobre ' + datos.servicio + '.'
    );
    $('#form-agenda').hidden = true;
    const caja = $('#confirmacion');
    caja.hidden = false;
    caja.focus();
    caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function reiniciarAgenda() {
    const form = $('#form-agenda');
    form.reset();
    Object.assign(estado.agenda, { servicio: '', fecha: '', hora: '' });
    $('#horas').textContent = '';
    $('#horas-ayuda').textContent = 'Primero elija un día en el calendario.';
    $('#datos-cita').hidden = true;
    $('#confirmacion').hidden = true;
    form.hidden = false;
    pintarCalendario();
  }

  function irAAgendar(servicio) {
    const select = $('#cita-servicio');
    if ([...select.options].some((o) => o.value === servicio)) select.value = servicio;
    if ($('#confirmacion').hidden === false) reiniciarAgenda();
    $('#agenda').scrollIntoView({ behavior: 'smooth' });
  }

  function iniciarAgenda() {
    const ag = estado.agenda;
    const zona = estado.ajustes.zona || 'America/Bogota';
    ag.hoy = A.ahoraEnZona(zona).fecha;
    ag.mes = ag.hoy.slice(0, 7);
    ag.mesMax = A.sumarDias(ag.hoy, Number(estado.ajustes.diasMaximos) || 60).slice(0, 7);

    $('#mes-anterior').addEventListener('click', () => { ag.mes = moverMes(ag.mes, -1); pintarCalendario(); });
    $('#mes-siguiente').addEventListener('click', () => { ag.mes = moverMes(ag.mes, 1); pintarCalendario(); });
    $('#form-agenda').addEventListener('submit', enviarCita);
    $('#otra-cita').addEventListener('click', reiniciarAgenda);
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-agendar]');
      if (b) irAAgendar(b.dataset.agendar);
    });
    pintarCalendario();
  }

  // ---------- Contacto ----------
  function iniciarContacto() {
    const form = $('#form-contacto');
    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      const error = $('#contacto-error');
      const exito = $('#contacto-exito');
      const wa = $('#contacto-wa');
      error.hidden = true; exito.hidden = true; wa.hidden = true;
      const datos = {
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        correo: form.correo.value.trim(),
        mensaje: form.mensaje.value.trim(),
        sitio_web: form.sitio_web.value
      };
      const falta = datos.nombre.length < 2 ? 'Escriba su nombre.'
        : datos.telefono.replace(/\D/g, '').length < 7 ? 'Escriba un celular válido.'
        : datos.mensaje.length < 5 ? 'Cuéntenos qué quiere asegurar.' : '';
      if (falta) { error.textContent = falta; error.hidden = false; return; }

      const boton = $('#contacto-enviar');
      boton.disabled = true;
      boton.textContent = 'Enviando…';
      try {
        const r = await api.mensaje(datos);
        form.reset();
        exito.hidden = false;
        if (r.vista) aviso('Vista previa: en el sitio publicado este mensaje se guarda en el panel y llega por correo.');
      } catch (e) {
        error.textContent = e.estado && e.estado < 500 ? e.message : 'No pudimos enviar el mensaje. Puede enviarlo por WhatsApp:';
        error.hidden = false;
        wa.href = enlaceWa('Hola SGP Seguros, soy ' + datos.nombre + ' (' + datos.telefono + '). ' + datos.mensaje);
        wa.hidden = false;
      } finally {
        boton.disabled = false;
        boton.textContent = 'Enviar mensaje';
      }
    });
  }

  // ---------- Arranque ----------
  async function iniciar() {
    iniciarMenu();
    try {
      const datos = await api.contenido();
      estado.ajustes = datos.ajustes || {};
      estado.servicios = datos.servicios || [];
      pintarAjustes();
      pintarSeguros();
      pintarPlanes();
      pintarGaleria(datos.fotos || []);
      pintarOpcionesAgenda();
      iniciarAgenda();
      iniciarContacto();
    } catch (e) {
      estado.ajustes = { whatsapp: '573207165772', mensajeWhatsapp: 'Hola SGP Seguros, quiero cotizar un seguro.' };
      $$('[data-wa]').forEach((a2) => { a2.href = enlaceWa(); });
      $('#lista-seguros').append(el('p', { clase: 'error', texto: 'No pudimos cargar la información. Escríbanos por WhatsApp al 320 716 5772.' }));
    }
  }

  iniciar();
})();
