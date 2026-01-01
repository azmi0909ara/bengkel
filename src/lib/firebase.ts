// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import 'firebase/firestore';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEGY6TsMdtLKpGVBJsJ6RGCcFA4xkRHMg",
  authDomain: "bengkel-95bb2.firebaseapp.com",
  databaseURL: "https://bengkel-95bb2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bengkel-95bb2",
  storageBucket: "bengkel-95bb2.firebasestorage.app",
  messagingSenderId: "923235156606",
  appId: "1:923235156606:web:c93f1f139bab4730d74e2f",
  measurementId: "G-3VSZKTMRGK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);