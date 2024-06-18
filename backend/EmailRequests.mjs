import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración del servidor de correo
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // O el puerto correcto para tu servidor SMTP
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: process.env.VITE_GOOGLE_EMAIL,
        pass: process.env.VITE_GOOGLE_PASSWORD,
    }
});

// Ruta para procesar la solicitud
app.get('/procesar-solicitud', async (req, res) => {
    const { nombre, email } = req.query;
    const password = generatePassword();

    const mailOptions = {
        from: '"Your Company" <pruebaspruebacr@gmail.com>',
        to: email,
        subject: "Solicitud Procesada",
        text: `Hola ${nombre}, tu correo para ingresar a la plataforma es: ${email} y tu contraseña generada es: ${password}
            Si lo deseas puedes cambiar la contraseña en el apartado de Perfil/Cambiar Contraseña.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);

        // Registrar el usuario en Firebase Authentication
        await admin.auth().createUser({
            email: email,
            password: password,
        });

        res.send("Correo enviado exitosamente y usuario registrado en Firebase.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al enviar el correo o registrar el usuario en Firebase.");
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(process.env.VITE_GOOGLE_EMAIL); // Debe imprimir tu email
    console.log(process.env.VITE_GOOGLE_PASSWORD); // Debe imprimir tu contraseña
});
