// Conexión a la base de datos y creación de tablas.
// En el computador usa SQLite (archivo local). Al publicar usa PostgreSQL (DATABASE_URL).
require('dotenv').config();
const crypto = require('crypto');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const usaPostgres = Boolean(process.env.DATABASE_URL);

const db = knex(
  usaPostgres
    ? {
        client: 'pg',
        connection: {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
        },
        pool: { min: 0, max: 5 }
      }
    : {
        client: 'better-sqlite3',
        connection: { filename: process.env.SQLITE_ARCHIVO || './datos.sqlite' },
        useNullAsDefault: true
      }
);
db.usaPostgres = usaPostgres;

const { AJUSTES_INICIALES, AJUSTES_PUBLICOS, SERVICIOS_INICIALES, FOTOS_INICIALES } = require('./datos-iniciales');



async function leerAjustes(conexion) {
  const filas = await (conexion || db)('ajustes').select('clave', 'valor');
  const ajustes = Object.assign({}, AJUSTES_INICIALES);
  filas.forEach((f) => {
    try { ajustes[f.clave] = JSON.parse(f.valor); } catch (e) { ajustes[f.clave] = f.valor; }
  });
  return ajustes;
}

async function guardarAjustes(cambios) {
  await db.transaction(async (trx) => {
    for (const [clave, valor] of Object.entries(cambios)) {
      if (!(clave in AJUSTES_INICIALES)) continue;
      await trx('ajustes').insert({ clave, valor: JSON.stringify(valor) })
        .onConflict('clave').merge();
    }
  });
}

// ---------- Crear tablas ----------
async function crearSiNoExiste(nombre, definir) {
  if (!(await db.schema.hasTable(nombre))) await db.schema.createTable(nombre, definir);
}

async function preparar() {
  await crearSiNoExiste('usuarios', (t) => {
    t.increments('id');
    t.string('usuario', 60).notNullable().unique();
    t.string('clave_hash', 100).notNullable();
  });
  await crearSiNoExiste('servicios', (t) => {
    t.increments('id');
    t.string('categoria', 60).defaultTo('Personas');
    t.string('nombre', 120).notNullable();
    t.text('descripcion');
    t.text('coberturas'); // JSON con la lista de coberturas
    t.string('imagen', 400);
    t.string('precio', 80); // texto libre, ej. "Desde $85.000/mes". Vacío = "Cotización sin costo"
    t.boolean('destacado').defaultTo(false);
    t.integer('orden').defaultTo(0);
  });
  await crearSiNoExiste('fotos', (t) => {
    t.increments('id');
    t.string('url', 400).notNullable();
    t.string('descripcion', 200);
    t.integer('orden').defaultTo(0);
  });
  await crearSiNoExiste('mensajes', (t) => {
    t.increments('id');
    t.string('nombre', 120).notNullable();
    t.string('telefono', 30).notNullable();
    t.string('correo', 160);
    t.text('mensaje').notNullable();
    t.timestamp('fecha').defaultTo(db.fn.now());
    t.boolean('leido').defaultTo(false);
  });
  await crearSiNoExiste('horarios', (t) => {
    t.increments('id');
    t.integer('dia_semana').notNullable(); // 0 domingo ... 6 sábado
    t.string('hora_inicio', 5).notNullable();
    t.string('hora_fin', 5).notNullable();
    t.boolean('activo').defaultTo(true);
  });
  await crearSiNoExiste('bloqueos', (t) => {
    t.increments('id');
    t.string('fecha', 10).notNullable();
    t.string('hora_inicio', 5); // vacío = día completo
    t.string('hora_fin', 5);
    t.string('motivo', 160);
  });
  await crearSiNoExiste('citas', (t) => {
    t.increments('id');
    t.string('nombre', 120).notNullable();
    t.string('telefono', 30).notNullable();
    t.string('correo', 160);
    t.string('fecha', 10).notNullable();
    t.string('hora', 5).notNullable();
    t.integer('duracion').notNullable();
    t.string('modalidad', 20).notNullable();
    t.string('servicio', 120);
    t.text('notas');
    t.string('estado', 20).defaultTo('pendiente');
    t.timestamp('creada').defaultTo(db.fn.now());
    t.index(['fecha']);
  });
  await crearSiNoExiste('ajustes', (t) => {
    t.string('clave', 60).primary();
    t.text('valor');
  });

  await sembrar();
}

async function sembrar() {
  const [{ total: nServicios }] = await db('servicios').count({ total: '*' });
  if (Number(nServicios) === 0) {
    await db('servicios').insert(
      SERVICIOS_INICIALES.map((s, i) => Object.assign({}, s, { coberturas: JSON.stringify(s.coberturas), orden: i + 1 }))
    );
  }
  const [{ total: nFotos }] = await db('fotos').count({ total: '*' });
  if (Number(nFotos) === 0) {
    await db('fotos').insert(FOTOS_INICIALES.map(([url, descripcion], i) => ({ url, descripcion, orden: i + 1 })));
  }
  const [{ total: nHorarios }] = await db('horarios').count({ total: '*' });
  if (Number(nHorarios) === 0) {
    // Lunes (1) a sábado (6), 8:00 a. m. a 6:00 p. m.
    await db('horarios').insert([1, 2, 3, 4, 5, 6].map((d) => ({ dia_semana: d, hora_inicio: '08:00', hora_fin: '18:00', activo: true })));
  }
  const [{ total: nAjustes }] = await db('ajustes').count({ total: '*' });
  if (Number(nAjustes) === 0) await guardarAjustes(AJUSTES_INICIALES);

  const [{ total: nUsuarios }] = await db('usuarios').count({ total: '*' });
  if (Number(nUsuarios) === 0) {
    const usuario = process.env.ADMIN_USUARIO || 'admin';
    let clave = process.env.ADMIN_CLAVE;
    if (!clave) {
      clave = crypto.randomBytes(6).toString('base64url');
      console.log('\n⚠️  No definiste ADMIN_CLAVE. Clave temporal del panel:');
      console.log('   Usuario: ' + usuario + '   Clave: ' + clave);
      console.log('   Cámbiala desde el panel (Ajustes > Cambiar clave).\n');
    }
    await db('usuarios').insert({ usuario, clave_hash: await bcrypt.hash(clave, 10) });
  }
}

module.exports = { db, preparar, leerAjustes, guardarAjustes, AJUSTES_INICIALES, AJUSTES_PUBLICOS };
