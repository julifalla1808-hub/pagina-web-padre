// Arranque del servidor de SGP Seguros.
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const { preparar } = require('./db');

const app = express();
const produccion = process.env.NODE_ENV === 'production';

if (produccion && !process.env.SESSION_SECRET) {
  console.error('Falta la variable SESSION_SECRET. Revise el README.');
  process.exit(1);
}

app.set('trust proxy', 1); // Render y otros hostings ponen un proxy delante
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'script-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': produccion ? [] : null // en el computador (http) no forzar https
    }
  }
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieSession({
  name: 'sgp_sesion',
  secret: process.env.SESSION_SECRET || 'solo-para-pruebas-locales',
  httpOnly: true,
  sameSite: 'lax',
  secure: produccion,
  maxAge: 8 * 60 * 60 * 1000 // 8 horas
}));

app.use('/api', require('./routes/publico'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));
app.use('/admin', express.static(path.join(__dirname, 'admin'), { index: 'panel.html' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: produccion ? '1h' : 0 }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

// Errores: nunca mostrar detalles internos al visitante.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Datos no válidos.' });
  res.status(500).json({ error: 'Ocurrió un error. Intente de nuevo o escríbanos por WhatsApp.' });
});

const puerto = Number(process.env.PORT) || 3000;
preparar()
  .then(() => app.listen(puerto, () => console.log(`SGP Seguros listo en http://localhost:${puerto}`)))
  .catch((e) => {
    console.error('No se pudo preparar la base de datos:', e.message);
    process.exit(1);
  });

module.exports = app;
