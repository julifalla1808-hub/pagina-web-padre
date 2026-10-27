/* Traducción de la página SGP Seguros (español ⇄ inglés).
   El español es el idioma original; aquí solo está el inglés.
   Para corregir una traducción, cambie el texto de la derecha. */
(function () {
'use strict';
const EN = {
// Encabezado y menú
'Saltar al contenido': 'Skip to content',
'SGP Seguros, inicio': 'SGP Seguros, home',
'Su seguridad primero': 'Your safety comes first',
'Abrir menú': 'Open menu',
'Principal': 'Main',
'Quiénes somos': 'About us',
'Seguros': 'Insurance',
'Planes': 'Plans',
'Galería': 'Gallery',
'Agendar cita': 'Book a meeting',
'Contacto': 'Contact',
'Cotizar por WhatsApp': 'Get a quote on WhatsApp',
// Portada
'Automóvil plateado en carretera': 'Silver car on the road',
'Seguros todo riesgo': 'Comprehensive insurance',
'Protegemos lo que usted': 'We protect what you',
'más valora.': 'value most.',
'Soluciones claras y confiables para personas, familias y empresas, con el respaldo de aseguradoras aliadas.': 'Clear, reliable solutions for individuals, families and businesses, backed by our partner insurance companies.',
'Brindamos asesoría a nivel nacional': 'We advise clients nationwide',
': desde nuestra sede principal en': ': from our headquarters in',
'acompañamos a clientes en toda Colombia.': 'we serve clients all over Colombia.',
'Agendar asesoría': 'Book a consultation',
'Cotización sin costo': 'Free quote',
'Asesoría personalizada': 'Personalized advice',
'Acompañamiento total': 'Full support',
'Servicios exequiales': 'Funeral services',
// Quiénes somos
'¿Quiénes': 'Who',
'somos?': 'we are',
'SGP SEGUROS es una empresa enfocada en satisfacer las necesidades de aseguramiento de nuestros clientes, contamos con más de 7 años de experiencia en el sector; Nuestro portafolio de productos cubre todas las áreas de riesgo, trabajamos de la mano con todas las compañías aseguradoras legalmente constituidas en Colombia.': 'SGP SEGUROS is a company focused on meeting the insurance needs of our clients, with more than 7 years of experience in the industry. Our product portfolio covers every area of risk, and we work hand in hand with all the legally established insurance companies in Colombia.',
'Misión': 'Mission',
'Somos una empresa de asesoría en la adquisición de seguros para empresa, familias y personas, confiable, íntegra y con enfoque social que ofrece sus servicios a nivel nacional, con el respaldo de sólidas compañías aseguradoras en Colombia, que brinda tranquilidad y protección a nuestros clientes protegiendo su familia, patrimonio y futuro.': 'We are a trustworthy company with integrity and a social focus that advises businesses, families and individuals on purchasing insurance. We offer our services nationwide, backed by solid insurance companies in Colombia, giving our clients peace of mind and protection for their family, assets and future.',
'Visión': 'Vision',
'Ser una empresa intermediaria de seguros líder en el mercado, altamente confiable, reconocida por nuestra excelencia en servicio al cliente, innovación en productos y soluciones, y por ser un socio confiable y seguro para nuestros asegurados.': 'To be a leading, highly trusted insurance brokerage, recognized for our excellent customer service, innovative products and solutions, and for being a reliable and secure partner for our policyholders.',
'Nuestros servicios': 'Our services',
'Asesoría en Afiliación y aportes a Seguridad social': 'Advice on Social Security enrollment and contributions',
'Outsourcing Seguridad Social para empresas e Independientes': 'Social Security outsourcing for companies and self-employed workers',
'ARL Riesgos Laborales Para empresas': 'ARL occupational risk insurance for companies',
'SG-SST Sistema de Gestión de Seguridad y Salud en el Trabajo': 'SG-SST Occupational Health and Safety Management System',
'Medicina Pre-pagada': 'Prepaid medical plans',
// Portafolio
'Portafolio de seguros': 'Insurance portfolio',
'Un seguro para cada cosa que usted': 'Insurance for everything you',
'cuida.': 'care about.',
'Vehículos, hogar, familia y negocio. Le ayudamos a elegir la cobertura justa y lo acompañamos si ocurre un imprevisto.': 'Vehicles, home, family and business. We help you choose the right coverage and stand by you when the unexpected happens.',
'Personas': 'Individuals',
'Hogar y familia': 'Home and family',
'Empresas': 'Businesses',
'Seguro de Autos Todo Riesgo': 'Comprehensive Auto Insurance',
'Su vehículo, respaldado en cada kilómetro. Un imprevisto en la vía no debe comprometer su patrimonio.': 'Your vehicle, protected every mile. An accident on the road should not put your assets at risk.',
'Accidentes y siniestros': 'Accidents and claims',
'Daños y reparaciones': 'Damage and repairs',
'Robo total o parcial': 'Total or partial theft',
'Responsabilidad civil': 'Liability',
'Asistencia 24/7': '24/7 assistance',
'Todo riesgo y SOAT': 'Comprehensive and SOAT (mandatory insurance)',
'Seguro de Motos': 'Motorcycle Insurance',
'Cada trayecto, con respaldo y asistencia. Quienes van en moto están más expuestos en la vía.': 'Every ride, with protection and assistance. Motorcyclists are more exposed on the road.',
'Accidentes en la vía': 'Road accidents',
'Hurto de su motocicleta': 'Motorcycle theft',
'Seguro de Hogar': 'Home Insurance',
'Protege tu hogar de manera integral ante cualquier evento inesperado.': 'Complete protection for your home against any unexpected event.',
'Protección para su vivienda': 'Protection for your home',
'Incendio, robo y daños': 'Fire, theft and damage',
'Seguro de Contenido': 'Contents Insurance',
'Lo que hay en su hogar también se asegura. Ideal para inquilinos y arrendatarios.': 'What is inside your home can be insured too. Ideal for tenants and renters.',
'Incendio y/o explosión': 'Fire and/or explosion',
'Daños por agua': 'Water damage',
'Hurto': 'Theft',
'Fenómenos naturales': 'Natural disasters',
'Daños accidentales': 'Accidental damage',
'Seguro de Vida Familiar': 'Family Life Insurance',
'Cuando se trata de la tranquilidad de su familia, protegerla es nuestra prioridad.': 'When it comes to your family’s peace of mind, protecting them is our priority.',
'Respaldo económico': 'Financial support',
'Invalidez': 'Disability',
'Enfermedades graves': 'Critical illness',
'Seguro PYMES': 'Small Business Insurance',
'Amparo ante cualquier daño que afecte la continuidad de su negocio.': 'Coverage against any damage that threatens the continuity of your business.',
'Todo riesgo empresarial': 'Commercial all-risk',
'Cumplimiento': 'Surety bonds',
'Empresas e independientes': 'Companies and self-employed',
'Cotizar': 'Get a quote',
// Por qué todo riesgo
'Por qué todo riesgo': 'Why comprehensive coverage',
'Los imprevistos ocurren.': 'The unexpected happens.',
'Su patrimonio sigue en pie.': 'Your assets stay protected.',
'Conductor llamando a su aseguradora tras un choque': 'Driver calling the insurer after a crash',
'Autos y motos': 'Cars and motorcycles',
'Un imprevisto en la vía no debe comprometer su patrimonio.': 'An accident on the road should not put your assets at risk.',
'Accidentes': 'Accidents',
'Respaldo ante colisiones y siniestros.': 'Coverage for collisions and claims.',
'Respaldo frente a daños a terceros.': 'Coverage for damage to third parties.',
'Lo acompañamos desde el primer momento.': 'We are with you from the very first moment.',
'Agendar asesoría de autos': 'Book an auto consultation',
'Fachada de una casa con garaje': 'Front of a house with a garage',
'Hogar y contenido': 'Home and contents',
'Aunque no sea propietario del inmueble, sus bienes merecen protección.': 'Even if you do not own the property, your belongings deserve protection.',
'Incendio y daños por agua': 'Fire and water damage',
'Fugas, filtraciones y accidentes.': 'Leaks, seepage and accidents.',
'Cobertura ante robos y atracos.': 'Coverage against theft and robbery.',
'Respaldo ante eventos de la naturaleza.': 'Coverage against natural events.',
'Agendar asesoría de hogar': 'Book a home consultation',
'Empresarios revisando documentos en una oficina': 'Business team reviewing documents in an office',
'Empresas y PYMES': 'Companies and small businesses',
'Instalaciones, equipos y mercancía.': 'Premises, equipment and inventory.',
'Pólizas para contratos y licitaciones.': 'Bonds for contracts and public tenders.',
'Para empresas e independientes.': 'For companies and the self-employed.',
'Agendar asesoría empresarial': 'Book a business consultation',
// Planes
'Planes a su medida': 'Tailored plans',
'Elija por dónde empezar.': 'Choose where to start.',
'La cotización no tiene costo.': 'Quotes are free.',
'Cada plan se ajusta a su vehículo, su vivienda o su empresa. Un asesor le presenta las opciones de varias aseguradoras.': 'Each plan is tailored to your vehicle, your home or your business. An advisor will show you options from several insurers.',
'Más solicitado': 'Most requested',
'Para usted, su vehículo, su vida y su salud.': 'For you, your vehicle, your life and your health.',
'Para su vivienda, sus bienes y los suyos.': 'For your home, your belongings and your loved ones.',
'Para la continuidad de su negocio.': 'For the continuity of your business.',
'Planes ajustados a sus necesidades': 'Plans tailored to your needs',
'Valor de referencia; depende de la cotización': 'Reference price; depends on the quote',
'Seguro de Vida': 'Life Insurance',
'Accidentes Personales': 'Personal Accident Insurance',
'Pólizas de Salud': 'Health Insurance',
'RC Médica': 'Medical Malpractice Liability',
'RC Profesional': 'Professional Liability',
'Y más pólizas a la medida de sus necesidades': 'And more policies tailored to your needs',
'Responsabilidad Civil Extracontractual': 'General Liability',
'Pólizas de Cumplimiento': 'Surety Bonds',
'RC Derivada de Cumplimiento': 'Liability Linked to Surety Bonds',
'Transporte de Mercancías': 'Cargo Insurance',
'Manejo y Fidelidad (empleados)': 'Employee Fidelity Insurance',
'Maquinaria y Equipo': 'Machinery and Equipment',
'Y más pólizas a la medida de su negocio': 'And more policies tailored to your business',
'Cotizar plan': 'Get a quote',
'Agendar': 'Book',
// Galería
'Protección para la vida': 'Protection for real',
'real.': 'life.',
'Su vehículo, respaldado en cada kilómetro': 'Your vehicle, protected every mile',
'Viaje tranquilo con su familia': 'Travel with peace of mind with your family',
'Cada trayecto con respaldo': 'Protection on every ride',
'Lo acompañamos cuando ocurre un imprevisto': 'We are there when the unexpected happens',
'Su hogar, protegido de manera integral': 'Your home, fully protected',
'Lo que hay en su hogar también se asegura': 'What is inside your home can be insured too',
'Protegemos su patrimonio': 'We protect your assets',
'La tranquilidad de su familia': 'Your family’s peace of mind',
'Continuidad para su negocio': 'Continuity for your business',
'Patrimonio empresarial respaldado': 'Business assets protected',
'Ampliar foto: ': 'Enlarge photo: ',
'Foto ampliada': 'Enlarged photo',
'Cerrar': 'Close',
// Agenda
'Agende su cita': 'Book your meeting',
'Hablemos en persona,': 'Let’s talk in person,',
'por llamada o por video.': 'by phone or by video.',
'Escoja el día y la hora que le queden mejor. Un asesor le confirmará la cita.': 'Choose the day and time that suit you best. An advisor will confirm your meeting.',
'¿Qué seguro le interesa?': 'Which insurance are you interested in?',
'Seguro o motivo': 'Insurance or reason',
'Elija un seguro…': 'Choose an insurance…',
'Asesoría general / otro': 'General advice / other',
'¿Cómo prefiere la cita?': 'How would you like to meet?',
'Modalidad de la cita': 'Meeting type',
'En persona': 'In person',
'Llamada': 'Phone call',
'Videollamada': 'Video call',
'Ciudad y lugar de la cita: le confirmaremos la dirección por WhatsApp.': 'City and place of the meeting: we will confirm the address on WhatsApp.',
'Le llamaremos al celular que nos deje.': 'We will call the mobile number you give us.',
'Le enviaremos el enlace de la videollamada por WhatsApp o correo.': 'We will send you the video call link by WhatsApp or email.',
'Elija el día': 'Choose the day',
'Mes anterior': 'Previous month',
'Mes siguiente': 'Next month',
'Días disponibles': 'Available days',
'Días con horas libres': 'Days with open times',
', con horas libres': ', times available',
', sin cupo': ', fully booked',
'Elija la hora': 'Choose the time',
'Primero elija un día en el calendario.': 'First, choose a day on the calendar.',
'Horas disponibles': 'Available times',
'Buscando horas libres…': 'Looking for open times…',
'No pudimos cargar las horas. Intente de nuevo o escríbanos por WhatsApp.': 'We could not load the times. Please try again or message us on WhatsApp.',
'Ese día ya no tiene horas libres. Elija otro día.': 'That day has no open times left. Please choose another day.',
'No pudimos cargar la agenda. Escríbanos por WhatsApp para agendar.': 'We could not load the calendar. Message us on WhatsApp to book.',
': elija una hora.': ': choose a time.',
'Mañana': 'Morning',
'Tarde': 'Afternoon',
'Sus datos': 'Your details',
'Nombre completo': 'Full name',
'Celular / WhatsApp': 'Mobile / WhatsApp',
'Correo': 'Email',
'(opcional)': '(optional)',
'Notas': 'Notes',
'Ej.: placa del vehículo, tipo de vivienda o de negocio': 'E.g.: license plate, type of home or business',
'Cita: ': 'Meeting: ',
'Continuar': 'Continue',
'Agendando…': 'Booking…',
'Elija el seguro que le interesa (paso 1).': 'Choose the insurance you are interested in (step 1).',
'Elija cómo prefiere la cita (paso 2).': 'Choose how you would like to meet (step 2).',
'Elija el día y la hora.': 'Choose the day and time.',
'Escriba su nombre.': 'Please enter your name.',
'Escriba un celular válido.': 'Please enter a valid mobile number.',
'Esa hora ya no está disponible. Por favor elija otra.': 'That time is no longer available. Please choose another one.',
'No pudimos conectar con el servidor.': 'We could not connect to the server.',
'¡Casi listo! Envíenos su cita': 'Almost done! Send us your meeting request',
'Fecha': 'Date',
'Hora': 'Time',
'Modalidad': 'Meeting type',
'Lugar': 'Place',
'Seguro': 'Insurance',
'Toque el botón verde para enviarnos estos datos por WhatsApp. Un asesor le confirmará la cita.': 'Tap the green button to send us these details on WhatsApp. An advisor will confirm your meeting.',
'Enviar cita por WhatsApp': 'Send meeting request on WhatsApp',
'Agendar otra cita': 'Book another meeting',
// Contacto
'Cotice hoy.': 'Get a quote today.',
'Le respondemos rápido.': 'We reply quickly.',
'Déjenos sus datos y un asesor lo contacta. Si prefiere, escríbanos directo por WhatsApp.': 'Leave us your details and an advisor will contact you. If you prefer, message us directly on WhatsApp.',
'Cotice por WhatsApp': 'Get a quote on WhatsApp',
'Sede principal': 'Headquarters',
'Cobertura': 'Coverage',
'Asesoría a nivel nacional': 'Nationwide advice',
'Horario': 'Hours',
'Lunes a sábado, 8:00 a. m. a 6:00 p. m.': 'Monday to Saturday, 8:00 AM to 6:00 PM',
'Escríbanos': 'Write to us',
'Nombre': 'Name',
'Celular': 'Mobile',
'¿Qué quiere asegurar?': 'What would you like to insure?',
'Ej.: quiero cotizar un todo riesgo para mi carro': 'E.g.: I would like a quote for comprehensive car insurance',
'¡Listo! Toque el botón verde para enviarnos su mensaje por WhatsApp.': 'Done! Tap the green button to send us your message on WhatsApp.',
'Preparar mensaje': 'Prepare message',
'Enviando…': 'Sending…',
'Enviar por WhatsApp': 'Send on WhatsApp',
'Cuéntenos qué quiere asegurar.': 'Tell us what you would like to insure.',
'No pudimos enviar el mensaje. Puede enviarlo por WhatsApp:': 'We could not send your message. You can send it on WhatsApp:',
'No pudimos cargar la información. Escríbanos por WhatsApp al 320 716 5772.': 'We could not load the information. Message us on WhatsApp at +57 320 716 5772.',
// Pie
'Cotice hoy por WhatsApp': 'Get a quote today on WhatsApp',
'Su tranquilidad,': 'Your peace of mind,',
'asegurada con SGP Seguros': 'insured with SGP Seguros',
'Escríbenos por WhatsApp': 'Message us on WhatsApp',
// Mensajes de WhatsApp
'Hola SGP Seguros, quiero cotizar un seguro.': 'Hello SGP Seguros, I would like an insurance quote.',
'Hola SGP Seguros, quiero cotizar el ': 'Hello SGP Seguros, I would like a quote for ',
'Hola SGP Seguros, quiero cotizar un plan de ': 'Hello SGP Seguros, I would like a quote for a plan for ',
'Hola SGP Seguros, quiero agendar una cita.': 'Hello SGP Seguros, I would like to book a meeting.',
'Hola SGP Seguros, soy ': 'Hello SGP Seguros, my name is ',
// Página
'titulo': 'SGP Seguros · Comprehensive insurance across Colombia',
'descripcion': 'SGP Seguros: auto, motorcycle, home, life and business insurance with nationwide advice. Headquarters in Armenia, Colombia. Free quotes on WhatsApp.'
};
const IDIOMAS = { es: 'Español', en: 'English' };
const SEMANA_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let idioma = 'es';
try {
const url = new URLSearchParams(location.search).get('lang');
const guardado = localStorage.getItem('sgp-idioma');
if (url && IDIOMAS[url]) idioma = url; else if (guardado && IDIOMAS[guardado]) idioma = guardado;
} catch (e) {  }
const originales = { titulo: document.title, descripcion: '' };
const ATRIBUTOS = ['alt', 'aria-label', 'placeholder', 'title'];
const textoOriginal = new WeakMap(); // nodo de texto -> { o: texto en español, t: texto mostrado }
const atributoOriginal = new WeakMap(); // elemento -> { atributo: [español, traducido] }
function T(s) {
if (idioma === 'es' || s == null) return s;
const k = String(s);
if (Object.prototype.hasOwnProperty.call(EN, k)) return EN[k];
if (k.startsWith('Ampliar foto: ')) return EN['Ampliar foto: '] + T(k.slice(14));
const hora = k.match(/^(\d{1,2}:\d{2}) ([ap])\. m\.$/);
if (hora) return hora[1] + ' ' + hora[2].toUpperCase() + 'M';
return k;
}
function traducirTexto(nodo) {
const p = nodo.parentElement;
if (!p || p.closest('script,style,svg,[data-no-traducir]')) return;
let reg = textoOriginal.get(nodo);
const actual = nodo.nodeValue;
if (!reg || (actual !== reg.o && actual !== reg.t)) {
reg = { o: actual, t: actual };
textoOriginal.set(nodo, reg);
}
const nuevo = traducirConEspacios(reg.o);
reg.t = nuevo;
if (nuevo !== actual) nodo.nodeValue = nuevo;
}
function traducirConEspacios(s) {
const t = s.trim();
if (!t) return s;
const tr = T(t);
return tr === t ? s : s.replace(t, tr);
}
function traducirAtributos(elemento) {
let mapa = atributoOriginal.get(elemento);
ATRIBUTOS.forEach((a) => {
if (!elemento.hasAttribute(a)) return;
const actual = elemento.getAttribute(a);
if (!mapa) { mapa = {}; atributoOriginal.set(elemento, mapa); }
const reg = mapa[a];
if (!reg || (actual !== reg[0] && actual !== reg[1])) mapa[a] = [actual, T(actual)];
else mapa[a][1] = T(mapa[a][0]);
if (mapa[a][1] !== actual) elemento.setAttribute(a, mapa[a][1]);
});
}
function traducirArbol(raiz) {
if (raiz.nodeType === 3) { traducirTexto(raiz); return; }
if (raiz.nodeType !== 1) return;
traducirAtributos(raiz);
raiz.querySelectorAll('*').forEach(traducirAtributos);
const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
let n;
while ((n = w.nextNode())) traducirTexto(n);
}
function aplicarPagina() {
document.documentElement.lang = idioma;
const meta = document.querySelector('meta[name="description"]');
if (meta && !originales.descripcion) originales.descripcion = meta.getAttribute('content');
document.title = idioma === 'es' ? originales.titulo : EN.titulo;
if (meta) meta.setAttribute('content', idioma === 'es' ? originales.descripcion : EN.descripcion);
document.querySelectorAll('.cal-semana span').forEach((s, i) => {
if (!s.dataset.es) s.dataset.es = s.textContent;
s.textContent = idioma === 'es' ? s.dataset.es : SEMANA_EN[i];
});
document.querySelectorAll('[data-idioma-boton]').forEach((b) => {
const otro = idioma === 'es' ? 'en' : 'es';
b.dataset.destino = otro;
b.querySelector('span').textContent = otro.toUpperCase();
b.setAttribute('aria-label', otro === 'en' ? 'View this page in English' : 'Ver la página en español');
b.setAttribute('lang', otro);
});
}
let observador = null;
function observar() {
if (!observador) {
observador = new MutationObserver((cambios) => {
observador.disconnect();
cambios.forEach((c) => {
if (c.type === 'childList') c.addedNodes.forEach(traducirArbol);
else if (c.type === 'characterData') traducirTexto(c.target);
else if (c.type === 'attributes') traducirAtributos(c.target);
});
observar();
});
}
observador.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
}
function cambiar(nuevo) {
if (!IDIOMAS[nuevo] || nuevo === idioma) return;
idioma = nuevo;
try { localStorage.setItem('sgp-idioma', idioma); } catch (e) {  }
if (observador) observador.disconnect();
traducirArbol(document.body);
aplicarPagina();
observar();
document.dispatchEvent(new CustomEvent('sgp:idioma', { detail: idioma }));
}
window.SGP_I18N = {
T,
idioma: () => idioma,
locale: () => (idioma === 'en' ? 'en-US' : 'es-CO'),
cambiar
};
function iniciar() {
document.addEventListener('click', (e) => {
const b = e.target.closest('[data-idioma-boton]');
if (b) cambiar(b.dataset.destino);
});
traducirArbol(document.body);
aplicarPagina();
observar();
}
iniciar();
})();
