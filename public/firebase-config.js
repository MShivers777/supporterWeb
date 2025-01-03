import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQ3OP9KQ4BCR2Dsmt38_vu5OlK3hRDNoE",
  authDomain: "supporterweb-firebase.firebaseapp.com",
  databaseURL: "https://supporterweb-firebase-default-rtdb.firebaseio.com",
  projectId: "supporterweb-firebase",
  storageBucket: "supporterweb-firebase.appspot.com",
  messagingSenderId: "503357203652",
  appId: "1:503357203652:web:5a7ba3fc2daa27c758d591",
  measurementId: "G-CFWKSHJ4W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { analytics, database, storage };