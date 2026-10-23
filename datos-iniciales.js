// Datos iniciales de SGP Seguros (tomados de sus piezas publicitarias).
// Se cargan la primera vez que arranca el servidor; luego se editan desde el panel.

// ---------- Ajustes (clave / valor) ----------
const AJUSTES_INICIALES = {
  nombre: 'SGP Seguros',
  eslogan: 'Su seguridad primero',
  whatsapp: '573207165772',
  mensajeWhatsapp: 'Hola SGP Seguros, quiero cotizar un seguro.',
  ciudad: 'Cali',
  direccion: '', // [Pendiente] dirección para citas en persona
  correoAvisos: 'gerencia@sgpseguros.co',
  correoPublico: 'gerencia@sgpseguros.co',
  horarioTexto: 'Lunes a sábado, 8:00 a. m. a 6:00 p. m.',
  facebook: '',
  instagram: '',
  duracion: 30,
  cupos: 1,
  modalidades: ['presencial', 'llamada', 'videollamada'],
  anticipacion: 120,
  diasMaximos: 60,
  zona: 'America/Bogota'
};

const AJUSTES_PUBLICOS = [
  'nombre', 'eslogan', 'whatsapp', 'mensajeWhatsapp', 'ciudad', 'direccion',
  'correoPublico', 'horarioTexto', 'facebook', 'instagram', 'duracion',
  'modalidades', 'diasMaximos', 'zona'
];

// ---------- Datos de ejemplo tomados de las piezas de SGP Seguros ----------
const SERVICIOS_INICIALES = [
  {
    categoria: 'Personas',
    nombre: 'Seguro de Autos Todo Riesgo',
    descripcion: 'Su vehículo, respaldado en cada kilómetro. Un imprevisto en la vía no debe comprometer su patrimonio.',
    coberturas: ['Accidentes y siniestros', 'Daños y reparaciones', 'Robo total o parcial', 'Responsabilidad civil', 'Asistencia 24/7', 'Todo riesgo y SOAT'],
    imagen: '/img/autos-familia.jpg',
    precio: '',
    destacado: true
  },
  {
    categoria: 'Personas',
    nombre: 'Seguro de Motos',
    descripcion: 'Cada trayecto, con respaldo y asistencia. Quienes van en moto están más expuestos en la vía.',
    coberturas: ['Accidentes en la vía', 'Daños y reparaciones', 'Hurto de su motocicleta', 'Responsabilidad civil'],
    imagen: '/img/moto.jpg',
    precio: '',
    destacado: false
  },
  {
    categoria: 'Hogar y familia',
    nombre: 'Seguro de Hogar',
    descripcion: 'Protege tu hogar de manera integral ante cualquier evento inesperado.',
    coberturas: ['Protección para su vivienda', 'Incendio, robo y daños', 'Responsabilidad civil'],
    imagen: '/img/hogar.jpg',
    precio: '',
    destacado: false
  },
  {
    categoria: 'Hogar y familia',
    nombre: 'Seguro de Contenido',
    descripcion: 'Lo que hay en su hogar también se asegura. Ideal para inquilinos y arrendatarios.',
    coberturas: ['Incendio y/o explosión', 'Daños por agua', 'Hurto', 'Fenómenos naturales', 'Daños accidentales'],
    imagen: '/img/contenido-hogar.jpg',
    precio: '',
    destacado: false
  },
  {
    categoria: 'Hogar y familia',
    nombre: 'Seguro de Vida Familiar',
    descripcion: 'Cuando se trata de la tranquilidad de su familia, protegerla es nuestra prioridad.',
    coberturas: ['Respaldo económico', 'Invalidez', 'Enfermedades graves', 'Servicios exequiales'],
    imagen: '/img/vida-familiar.jpg',
    precio: '',
    destacado: false
  },
  {
    categoria: 'Empresas',
    nombre: 'Seguro PYMES',
    descripcion: 'Amparo ante cualquier daño que afecte la continuidad de su negocio.',
    coberturas: ['Todo riesgo empresarial', 'Cumplimiento', 'Responsabilidad civil', 'Empresas e independientes'],
    imagen: '/img/pymes.jpg',
    precio: '',
    destacado: false
  }
];

const FOTOS_INICIALES = [
  ['/img/auto-deportivo.jpg', 'Su vehículo, respaldado en cada kilómetro'],
  ['/img/autos-familia.jpg', 'Viaje tranquilo con su familia'],
  ['/img/moto.jpg', 'Cada trayecto con respaldo'],
  ['/img/accidente.jpg', 'Lo acompañamos cuando ocurre un imprevisto'],
  ['/img/hogar.jpg', 'Su hogar, protegido de manera integral'],
  ['/img/contenido-hogar.jpg', 'Lo que hay en su hogar también se asegura'],
  ['/img/casa-mano.jpg', 'Protegemos su patrimonio'],
  ['/img/vida-familiar.jpg', 'La tranquilidad de su familia'],
  ['/img/pymes.jpg', 'Continuidad para su negocio'],
  ['/img/incendio-empresa.jpg', 'Patrimonio empresarial respaldado']
];

module.exports = { AJUSTES_INICIALES, AJUSTES_PUBLICOS, SERVICIOS_INICIALES, FOTOS_INICIALES };
