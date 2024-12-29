import firebase from 'firebase/app';
import 'firebase/database';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3CX7UhK60TLJyblSGKv7DhZBkz6-u4rU",
  authDomain: "supporter-web-a79ca.firebaseapp.com",
  databaseURL: "https://supporter-web-a79ca-default-rtdb.firebaseio.com",
  projectId: "supporter-web-a79ca",
  storageBucket: "supporter-web-a79ca.firebasestorage.app",
  messagingSenderId: "757120613952",
  appId: "1:757120613952:web:920f329039e080d2b029a5",
  measurementId: "G-Y1M8JDVDNN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const prayerListRef = database.ref('prayerList');

// Read data from the database
prayerListRef.on('value', (snapshot) => {
  const prayerList = snapshot.val();
  // Use the prayerList data to update your UI
});

// Add a new prayer to the database
const newPrayer = {
  name: 'New Person',
  prayer: 'Please bless...',
  completed: false,
  imageUrl: 'https://example.com/image.jpg'
};

prayerListRef.push(newPrayer);

// Update a prayer
const updatedPrayer = {
  name: 'Updated Name',
  // ... other properties
};
const prayerRef = prayerListRef.child('prayerId'); // Replace 'prayerId' with the actual ID
prayerRef.update(updatedPrayer);

// Delete a prayer
prayerRef.remove();



function addRow() {
  let table = document.getElementById("myTable");
  let newName = document.getElementById("newName").value.trim(); // Trim whitespace
  let newDetail = document.getElementById("newDetail").value.trim(); // Trim whitespace
  let newNote = document.getElementById("newNote").value.trim(); // Trim whitespace

  // Check if any of the input fields are empty
  if (newName === "" || newDetail === "" || newNote === "") {
      alert("Please fill in all fields."); // Or some other user feedback
      return; // Stop the function from adding a row
  }

  let newRow = table.insertRow();
  newRow.classList.add('tr');
  let cell1 = newRow.insertCell(0);
  let cell2 = newRow.insertCell(1);
  let cell3 = newRow.insertCell(2);
  let cell4 = newRow.insertCell(3); // Cell for the checkbox

  cell1.innerHTML = newName;
  cell2.innerHTML = newDetail;
  cell3.innerHTML = newNote;

  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  cell4.appendChild(checkbox);

  // Clear input fields
  document.getElementById("newName").value = "";
  document.getElementById("newDetail").value = "";
  document.getElementById("newNote").value = "";
}


fetch('prayer_list.json')
  .then(response => response.json())
  .then(data => {
    // Now you have the data in the 'data' variable
    console.log(data);
  });