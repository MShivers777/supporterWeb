import { database, storage } from '../src/config/firebase.js';
import { ref, push, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeDebugger } from './debug-utils';
initializeDebugger();

const prayerListRef = ref(database, 'prayerList');

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

  console.log('Adding prayer:', { name, prayer, note, image });

  if (image) {
    const imageRef = storageRef(storage, 'images/' + image.name);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        push(prayerListRef, { name, prayer, note, image: url });
        console.log('Prayer added with image URL:', url);
      });
    });
  } else {
    push(prayerListRef, { name, prayer, note, image: '' });
    console.log('Prayer added without image');
  }

  document.getElementById('newName').value = '';
  document.getElementById('newDetail').value = '';
  document.getElementById('newNote').value = '';
}

document.getElementById('add-person').addEventListener('click', addPrayer);
console.log('Event listener attached to add-person button');
renderPrayerList();