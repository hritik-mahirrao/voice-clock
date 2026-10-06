import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIo6T6pmJertVDeBgguuBxaF9EJmUFGRE",
  authDomain: "voice-clock-75111.firebaseapp.com",
  projectId: "voice-clock-75111",
  storageBucket: "voice-clock-75111.firebasestorage.app",
  messagingSenderId: "710599802936",
  appId: "1:710599802936:web:b7a4888e3dbce286b966cd",
  measurementId: "G-SSLZJEKYDX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
