import { database, storage } from './firebase-config.js';
import { ref, push, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const prayerListRef = firebase.database().ref('prayerList');

function renderPrayerList() {
  onValue(prayerListRef, (snapshot) => {
    const data = snapshot.val();
    const table = document.getElementById('prayer-table');
    table.innerHTML = '<tr><th>Person</th><th>Prayer Request</th><th>Note</th><th>Select</th></tr>';

    for (const key in data) {
      const row = table.insertRow();
      row.innerHTML = `
        <td>${data[key].name}</td>
        <td>${data[key].prayer}</td>
        <td>${data[key].note}</td>
        <td><input type="checkbox" data-key="${key}"></td>
      `;
    }
  });
}

function addPrayer() {
  const name = document.getElementById('newName').value;
  const prayer = document.getElementById('newDetail').value;
  const note = document.getElementById('newNote').value;
  const image = document.getElementById('newImage').files[0];

  if (image) {
    const imageRef = firebase.storage().ref('images/' + image.name);
    imageRef.put(image).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        prayerListRef.push({ name, prayer, note, image: url });
      });
    });
  } else {
    prayerListRef.push({ name, prayer, note, image: '' });
  }
  

  document.getElementById('newName').value = '';
  document.getElementById('newDetail').value = '';
  document.getElementById('newNote').value = '';
}

document.getElementById('add-person').addEventListener('click', addPrayer);
renderPrayerList();
