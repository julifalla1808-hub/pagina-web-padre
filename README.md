# Sitio web de SGP Seguros

Página web de SGP Seguros (Cali) con:

- Portafolio de seguros todo riesgo (autos, motos, hogar, contenido, vida familiar y PYMES).
- Planes con "Cotización sin costo" (si luego quiere mostrar precios, se ponen desde el panel).
- Galería de fotos que se amplían al tocarlas.
- **Agenda por fecha y hora**: en persona, por llamada o por videollamada.
- Formulario de contacto que se guarda y le avisa por correo.
- Botón de WhatsApp (320 716 5772) en toda la página.
- **Panel de administrador** en `/admin` para manejar citas, mensajes, horarios, seguros, precios, fotos y datos.

Funciona en celular y computador.

---

## 1. Probarlo en su computador

Necesita **Node.js 20 o más nuevo** (descárguelo de https://nodejs.org, versión "LTS").

1. Descomprima el archivo `.zip` en una carpeta.
2. Abra una terminal en esa carpeta y escriba:
   ```
   npm install
   ```
3. Copie el archivo `.env.example` y llame a la copia `.env`. Ábrala y cambie al menos `ADMIN_CLAVE` y `SESSION_SECRET`.
4. Arranque el servidor:
   ```
   npm start
   ```
5. Abra en el navegador:
   - Sitio: http://localhost:3000
   - Panel: http://localhost:3000/admin (usuario y clave del archivo `.env`)

Para revisar que todo funcione: `npm test`.

En el computador los datos se guardan en el archivo `datos.sqlite`.

---

## 2. Crear la base de datos gratuita (para publicar)

Los hostings gratuitos borran los archivos cuando se reinician. Por eso, al publicar, los datos van en una base de datos en la nube.

1. Entre a https://neon.tech y cree una cuenta gratis (también sirve https://supabase.com).
2. Cree un proyecto llamado `sgp-seguros`.
3. Copie la **cadena de conexión** (empieza por `postgresql://...`).
4. Esa cadena es su `DATABASE_URL`. Guárdela para el paso 4.

Las tablas y los datos de ejemplo se crean solos la primera vez que arranca el servidor.

---

## 3. Contraseña de aplicación de Gmail (para los avisos por correo)

Los avisos se envían desde una cuenta de Gmail hacia **gerencia@sgpseguros.co** (se cambia en el panel).

1. Entre a la cuenta de Google que enviará los correos.
2. Active la **verificación en dos pasos** (Seguridad > Verificación en dos pasos).
3. Busque **"Contraseñas de aplicaciones"**, cree una llamada `SGP web` y copie la clave de 16 letras.
4. Esa clave es `GMAIL_CLAVE_APP`, y el correo de esa cuenta es `GMAIL_USUARIO`.

Si no configura esto, la página funciona igual, pero no llegan correos (las citas y mensajes quedan en el panel).

---

## 4. Publicarlo gratis en Render

1. Cree una cuenta en https://github.com y suba esta carpeta como un repositorio nuevo (sin el archivo `.env` ni `datos.sqlite`; el `.gitignore` ya los excluye).
2. Cree una cuenta en https://render.com y elija **New > Web Service**.
3. Conecte su repositorio de GitHub.
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. En **Environment** agregue estas variables:

   | Variable | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | la cadena de Neon o Supabase |
   | `SESSION_SECRET` | una frase larga y secreta (mínimo 32 letras) |
   | `ADMIN_USUARIO` | el usuario del panel |
   | `ADMIN_CLAVE` | la clave del panel (mínimo 8 caracteres) |
   | `GMAIL_USUARIO` | el correo de Gmail que envía avisos |
   | `GMAIL_CLAVE_APP` | la contraseña de aplicación |
   | `CLOUDINARY_URL` | (opcional) para guardar fotos subidas desde el panel |

6. Pulse **Create Web Service**. En unos minutos tendrá un enlace como `https://sgp-seguros.onrender.com`.

**Fotos subidas desde el panel:** sin `CLOUDINARY_URL`, las fotos nuevas se borran cuando Render reinicia. Cree una cuenta gratis en https://cloudinary.com, copie su "API Environment variable" (empieza por `cloudinary://`) y péguela en `CLOUDINARY_URL`. Las fotos que vienen con la página no tienen este problema.

> **Aviso:** en el plan gratuito de Render el sitio "se duerme" después de unos 15 minutos sin visitas. La primera visita después de eso tarda unos segundos en cargar. Con un plan pago esto no pasa.

---

## 5. Lo primero que debe hacer en el panel

1. **Datos del negocio:** escribir la **dirección de la oficina** para las citas en persona (hoy dice que se confirma por WhatsApp).
2. **Horarios y bloqueos:** revisar el horario (lunes a sábado, 8:00 a. m. a 6:00 p. m., citas de 30 minutos, 1 cita a la vez). Si atienden varios asesores, suba "Citas a la misma hora".
3. **Datos del negocio > Cambiar clave**.
4. Agregar enlaces de Facebook e Instagram si los tienen.

---

## Estructura del proyecto

```
server.js              arranque del servidor
db.js                  base de datos y creación de tablas
datos-iniciales.js     seguros, fotos y datos de ejemplo de SGP
routes/publico.js      contenido, mensajes y agenda
routes/admin.js        panel (protegido con clave)
services/agenda.js     horas disponibles
services/correo.js     avisos por correo
public/                sitio público (index.html, estilos.css, js/, img/)
admin/                 panel de administrador
pruebas/               pruebas automáticas (npm test)
```
