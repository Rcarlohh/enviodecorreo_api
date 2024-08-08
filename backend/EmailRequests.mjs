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
      from: '"Your Company" <pruebaspruebacr@gmail.com>',
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
            <div style="background-color: #f7f7f7; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333333; text-align: center;">Nueva Solicitud de Unión</h2>
                    <p style="color: #666666;">Se ha recibido una nueva solicitud de unión con los siguientes detalles:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Nombre del Interesado:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Cargo o Puesto:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${cargo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Compañía:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${asociacion}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Teléfono:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${telefono}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Correo Electrónico:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Ciudad que Desea Localizar:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${ciudad}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Motivo:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${motivo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dddddd; background-color: #fafafa;">
                                <strong>Servicio Solicitado:</strong>
                            </td>
                            <td style="padding: 10px; border: 1px solid #dddddd;">${servicio}</td>
                        </tr>
                    </table>
                    <p style="color: #666666; text-align: center; margin-top: 20px;">Gracias por utilizar nuestros servicios.</p>
                </div>
            </div>
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
