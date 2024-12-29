// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ3OP9KQ4BCR2Dsmt38_vu5OlK3hRDNoE",
  authDomain: "supporterweb-firebase.firebaseapp.com",
  databaseURL: "https://supporterweb-firebase-default-rtdb.firebaseio.com",
  projectId: "supporterweb-firebase",
  storageBucket: "supporterweb-firebase.firebasestorage.app",
  messagingSenderId: "503357203652",
  appId: "1:503357203652:web:5a7ba3fc2daa27c758d591",
  measurementId: "G-CFWKSHJ4W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);