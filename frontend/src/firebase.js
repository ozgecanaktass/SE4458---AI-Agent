// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0iGefEc0H9rCHW4_-6copmkkKwz46_jE",
  authDomain: "mobile-billing-chat.firebaseapp.com",
  projectId: "mobile-billing-chat",
  storageBucket: "mobile-billing-chat.firebasestorage.app",
  messagingSenderId: "321821695896",
  appId: "1:321821695896:web:9731da65f3a5cc867495ed",
  measurementId: "G-VH8DE9ZV3Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
