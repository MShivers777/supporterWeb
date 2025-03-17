import { db, database, storage, auth } from './config/firebase';
import { addPerson, getPeople } from './services/personService';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Application initialized');

  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  
  // Add login button handler
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      try {
        console.log('Attempting Google sign in...');
        const result = await signInWithPopup(auth, provider);
        console.log('Sign in successful:', result.user.email);
      } catch (error) {
        console.error('Login failed:', error.message);
      }
    });
  }

  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('👤 User logged in:', user.email);
      document.body.classList.add('authenticated');
      try {
        const people = await getPeople();
        renderPeopleList(people);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    } else {
      console.log('👤 User logged out');
      document.body.classList.remove('authenticated');
    }
  });

  // Handle file selection
  const imageInput = document.getElementById('newImage');
  const selectedFile = document.getElementById('selected-file');
  const fileNameSpan = selectedFile.querySelector('.file-name');
  
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
      selectedFile.classList.remove('hidden');
    } else {
      selectedFile.classList.add('hidden');
    }
  });

  // Handle file removal
  selectedFile.querySelector('.remove-file').addEventListener('click', () => {
    imageInput.value = '';
    selectedFile.classList.add('hidden');
  });

  // Add Person Form Handler
  const addPersonForm = document.getElementById('add-person');
  addPersonForm.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('newName').value;
    const detail = document.getElementById('newDetail').value;
    const note = document.getElementById('newNote').value;
    const imageInput = document.getElementById('newImage');
    const imageFile = imageInput.files.length > 0 ? imageInput.files[0] : null;

    if (!name || !detail || !note) {
      console.error('Please fill all fields');
      return;
    }

    try {
      const personData = {
        name,
        prayer: detail,
        note,
        image: imageFile,
        dateAdded: new Date().toISOString()
      };

      console.log('Adding person:', personData);
      await addPerson(personData);
      
      // Clear form
      document.getElementById('newName').value = '';
      document.getElementById('newDetail').value = '';
      document.getElementById('newNote').value = '';
      document.getElementById('newImage').value = '';
      
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  });
});

function renderPeopleList(people) {
  const tbody = document.querySelector('#prayer-table tbody');
  tbody.innerHTML = people.map(person => `
    <tr>
      <td>${person.name}</td>
      <td>${person.prayer}</td>
      <td>${person.note}</td>
      <td><input type="checkbox" data-id="${person.id}"></td>
    </tr>
  `).join('');
}