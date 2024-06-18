import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no hay aplicaciones inicializadas
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider)
    .then((result) => {
      return result.user; // Retorna el usuario
    })
    .catch((error) => {
      console.error(error);
      throw error; // Lanza el error para que pueda ser capturado en el .catch() del componente
    });
};

const signOutUser = () => {
  return signOut(auth)
    .then(() => {
      console.log('Sesión cerrada exitosamente');
    })
    .catch((error) => {
      console.error('Error al cerrar sesión:', error);
      throw error;
    });
};

export { signInWithGoogle, signOutUser };
