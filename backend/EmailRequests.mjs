import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import cors from 'cors';  // Importar cors
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa la app de Firebase Admin
import serviceAccount from './config/serviceAccountKey.json' assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Usar CORS con configuraciones personalizadas
app.use(cors({
  origin: 'http://localhost:5173', // Reemplaza con la URL de tu frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'] // Headers permitidos
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración del servidor de correo y demás rutas...


// Configuración del servidor de correo
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.VITE_GOOGLE_EMAIL,
    pass: process.env.VITE_GOOGLE_PASSWORD,
  }
});

// Ruta para procesar la solicitud
app.get('/procesar-solicitud', async (req, res) => {
  const { nombre, email } = req.query;
  const password = generatePassword();

  try {
    await admin.auth().createUser({
      email: email,
      password: password,
    });

    const mailOptions = {
      from: '"Your Company" <gustavo.webplatform@gmail.com>',
      to: email,
      subject: "Solicitud Procesada",
      text: `Hola ${nombre}, tu correo para ingresar a la plataforma es: ${email} y tu contraseña generada es: ${password}.
      Si lo deseas puedes cambiar la contraseña en el apartado de Perfil/Cambiar Contraseña.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Correo Enviado</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            text-align: center;
          }
        </style>
        <script>
          setTimeout(function() {
            window.close();}, 10000);
        </script>
      </head>
      <body>
        <div>
          <h1>Correo enviado exitosamente y usuario registrado en Firebase.</h1>
          <p>Esta ventana se cerrará automáticamente en 10 segundos.</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              text-align: center;
            }
          </style>
          <script>
            setTimeout(function() {
              window.close();
            }, 10000);
          </script>
        </head>
        <body>
          <div>
            <h1>La dirección de correo electrónico ya está en uso por otra cuenta.</h1>
            <p>Esta ventana se cerrará automáticamente en 10 segundos.</p>
          </div>
        </body>
        </html>
      `);
    } else {
      console.error(error);
      res.status(500).send("Error al enviar el correo o registrar el usuario en Firebase.");
    }
  }
});

// Nueva ruta para enviar correos a través de /send-email-contact
app.post('/send-email-contact', async (req, res) => {
    const { name, email, message } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
  
    console.log("Email to send:", email);
  
    try {
      const mailOptions = {
        from: `"Contacto" <${process.env.VITE_GOOGLE_EMAIL}>`,
        to: email, // Correo electrónico que llega desde req.body.email
        subject: "Solicito de sus servicios",
        text: `Name: ${nombre}\nEmail: ${email}\nMessage: ${message}`,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Contact form email sent: %s', info.messageId);
  
      res.status(200).json({ message: "Email sent successfully!" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });


//Envio del Formulario
app.post('/send-form', (req, res) => {
  const { nombre, cargo, asociacion, telefono, email, ciudad, motivo, servicio } = req.body;

  const mailOptions = {
      from: 'gustavo.webplatform@gmail.com', // Remitente del correo
      to: 'gustavo.webplatform@gmail.com', // Reemplaza con el correo del destinatario
      subject: 'Nueva solicitud de unión',
      html: `
      <html>
      <head>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
              }
              .card {
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border: 1px solid #ddd;
              }
              .header {
                  background-color: #347AB6;
                  color: white;
                  padding: 20px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
                  color: #333333;
              }
              .content table {
                  width: 100%;
                  border-collapse: collapse;
              }
              .content table, .content th, .content td {
                  border: 1px solid #ddd;
              }
              .content th, .content td {
                  padding: 10px;
                  text-align: left;
              }
              .content th {
                  background-color: #f4f4f4;
              }
              .button-container {
                  text-align: center;
                  margin: 20px 0;
              }
              .button {
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-size: 16px;
                  border: 2px solid #347AB6;
                  color: #347AB6;
                  background-color: transparent;
                  margin: 5px;
              }
              .button:hover {
                  background-color: #347AB6;
                  color: white;
              }
              .button-reject {
                  border: 2px solid #ff6f61;
                  color: #ff6f61;
              }
              .button-reject:hover {
                  background-color: #ff6f61;
                  color: white;
              }
              .footer {
                  text-align: center;
                  padding: 10px 0;
                  background-color: #f1f1f1;
                  border-radius: 0 0 10px 10px;
                  color: #888888;
                  position: relative;
                  overflow: hidden;
              }
              .footer p {
                  margin: 0;
                  font-size: 12px;
              }
              .truck-design {
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  width: 100%;
                  height: 80px;
                  background: url('https://example.com/truck-design.png') no-repeat center bottom;
                  background-size: cover;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="card">
                  <div class="header">
                      <h1>Solicitud de Registro de la Plataforma Web</h1>
                  </div>
                  <div class="content">
                      <table>
                          <tr>
                              <th>Nombre</th>
                              <td>${nombre}</td>
                          </tr>
                          <tr>
                              <th>Cargo</th>
                              <td>${cargo}</td>
                          </tr>
                          <tr>
                              <th>Compañía</th>
                              <td>${asociacion}</td>
                          </tr>
                          <tr>
                              <th>Teléfono</th>
                              <td>${telefono}</td>
                          </tr>
                          <tr>
                              <th>Correo Electrónico</th>
                              <td>${email}</td>
                          </tr>
                          <tr>
                              <th>Ciudad</th>
                              <td>${ciudad}</td>
                          </tr>
                          <tr>
                              <th>Motivo</th>
                              <td>${motivo}</td>
                          </tr>
                          <tr>
                              <th>Servicio</th>
                              <td>${servicio}</td>
                          </tr>
                      </table>
                      <div class="button-container">
                          <a href="http://trapape.api:1701/procesar-solicitud?nombre=${nombre}&email=${email}" class="button">Procesar Solicitud</a>
                          <a href="http://main.d524xsx7dlqze.amplifyapp.com/rechazar-solicitud" class="button button-reject">Rechazar Solicitud</a>
                      </div>
                  </div>
              </div>
              <div class="footer">
                  <p>&copy; 2024 MiEmpresa. Todos los derechos reservados.</p>
                  <div class="truck-design"></div>
              </div>
          </div>
      </body>
      </html>
      `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log('Error al enviar correo:', error);
          return res.status(500).json({ message: 'Error al enviar correo' });
      }
      console.log('Correo enviado:', info.response);
      res.status(200).json({ message: 'Correo enviado exitosamente' });
  });
});

  

// Ruta para rechazar la solicitud
app.get('/rechazar-solicitud', (req, res) => {
  res.send(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud Rechazada</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          text-align: center;
        }
      </style>
      <script>
        setTimeout(function() {
          window.close();
        }, 10000);
      </script>
    </head>
    <body>
      <div>
        <h1>La solicitud ha sido eliminada.</h1>
        <p>Esta ventana se cerrará automáticamente en 10 segundos.</p>
      </div>
    </body>
    </html>
  `);
});

//Correo de contactos
app.post('/email-contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const mailOptions = {
        from: `"Contacto" <${process.env.VITE_GOOGLE_EMAIL}>`,
        to: process.env.VITE_GOOGLE_EMAIL, 
        subject: subject,
        html: `
            <div style="background-color: #f7f7f7; padding: 20px; font-family: Arial, sans-serif;">
                <h2>Nuevo Mensaje de Contacto</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Correo Electrónico:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Contact form email sent: %s', info.messageId);

      res.status(200).json({ message: "Email sent successfully!" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send email." });
    }
});
// Función para generar una contraseña aleatoria
function generatePassword() {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const PORT = 1701;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(process.env.VITE_GOOGLE_EMAIL); // Debe imprimir tu email
  console.log(process.env.VITE_GOOGLE_PASSWORD); // Debe imprimir tu contraseña
});
