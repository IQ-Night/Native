// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB9Ry7uAzGu0urFY6Rbh0n899tNgbCWoK0",
  authDomain: "iq-night.firebaseapp.com",
  projectId: "iq-night",
  storageBucket: "iq-night.appspot.com",
  messagingSenderId: "932979354324",
  appId: "1:932979354324:web:455219936be33adba52941",
  measurementId: "G-M6QTKYD9FH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
