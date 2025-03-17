import { db, database, storage, auth } from './config/firebase';
import { addPerson, getPeople, updatePerson, deletePerson, getAnsweredPrayers, markPrayerAsAnswered, getCurrentPrayerIndex, updateCurrentPrayerIndex, deleteAnsweredPrayer } from './services/personService';
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

  // Move initial data loading to after auth confirmation
  const loadInitialData = async () => {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in, skipping data load');
        return;
      }

      const people = await getPeople();
      const currentIndex = await getCurrentPrayerIndex();
      const answeredPrayers = await getAnsweredPrayers();
      
      renderPeopleList(people);
      renderAnsweredPrayers(answeredPrayers);
      if (people.length > 0) {
        await updatePrayerFocus(people, currentIndex);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('👤 User logged in:', user.email);
      document.body.classList.add('authenticated');
      await loadInitialData();
    } else {
      console.log('👤 User not logged in');
      document.body.classList.remove('authenticated');
      // Reset UI for logged out state
      document.getElementById('current-name').textContent = 'Please log in';
      document.getElementById('current-description').textContent = 'Login to track your prayer requests';
      document.getElementById('current-image').src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f0f0f0"/%3E%3C/svg%3E';
    }
  });

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => 
        content.classList.remove('active')
      );

      // Add active class to clicked button and its content
      button.classList.add('active');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
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

    if (!name || !detail) {  // Remove note from required fields
      console.error('Please fill in name and prayer request');
      return;
    }

    try {
      const personData = {
        name,
        prayer: detail,
        note: note || '',  // Use empty string if note is empty
        image: imageFile,
        dateAdded: new Date().toISOString()
      };

      console.log('Adding person:', personData);
      await addPerson(personData);
      
      // Refresh the prayer focus after adding
      const people = await getPeople();
      const currentIndex = await getCurrentPrayerIndex();
      await updatePrayerFocus(people, currentIndex);
      
      // Clear form
      document.getElementById('newName').value = '';
      document.getElementById('newDetail').value = '';
      document.getElementById('newNote').value = '';
      document.getElementById('newImage').value = '';
      
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  });

  // Update prayer focus function
  const updatePrayerFocus = async (people, currentIndex) => {
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f0f0f0"/%3E%3C/svg%3E';
    
    if (people.length === 0) {
      // Handle empty list case
      document.getElementById('current-name').textContent = 'No prayer requests yet';
      document.getElementById('current-description').textContent = 'Add someone to get started';
      document.getElementById('current-image').src = placeholderImage;
      return;
    }
    
    const person = people[currentIndex % people.length];
    document.getElementById('current-name').textContent = person.name;
    document.getElementById('current-description').textContent = `Prayer Request - ${person.prayer}\n${person.note}`;
    
    if (person.imageUrl) {
      document.getElementById('current-image').src = person.imageUrl;
    } else {
      document.getElementById('current-image').src = placeholderImage;
    }
    
    // Update table highlighting
    document.querySelectorAll('#prayer-table tbody tr').forEach((row, index) => {
      row.classList.toggle('current-focus', index === currentIndex);
    });
    
    // Store current index for persistence
    localStorage.setItem('currentPrayerIndex', currentIndex);
  };

  // Prayer Today Handler
  document.getElementById('prayed-today').addEventListener('click', async () => {
    try {
      const people = await getPeople();
      if (people.length === 0) return;

      const currentIndex = await getCurrentPrayerIndex();
      const nextIndex = (currentIndex + 1) % people.length;
      
      await updateCurrentPrayerIndex(nextIndex);
      await updatePrayerFocus(people, nextIndex);
    } catch (error) {
      console.error('Failed to update prayer focus:', error);
    }
  });

  // Prayer Answered Handler
  document.getElementById('prayer-answered').addEventListener('click', async () => {
    try {
      const people = await getPeople();
      const currentIndex = await getCurrentPrayerIndex();
      const currentPerson = people[currentIndex % people.length];
      
      await markPrayerAsAnswered(currentPerson.id);
      
      // Update both tables
      const updatedPeople = await getPeople();
      const answeredPrayers = await getAnsweredPrayers();
      
      renderPeopleList(updatedPeople);
      renderAnsweredPrayers(answeredPrayers);
      
      // Update prayer focus
      await updateCurrentPrayerIndex(currentIndex % updatedPeople.length);
      await updatePrayerFocus(updatedPeople, currentIndex % updatedPeople.length);
    } catch (error) {
      console.error('Failed to mark prayer as answered:', error);
    }
  });

  // Initial load of answered prayers
  try {
    const answeredPrayers = await getAnsweredPrayers();
    renderAnsweredPrayers(answeredPrayers);
  } catch (error) {
    console.error('Failed to load answered prayers:', error);
  }
});

function renderPeopleList(people) {
  const tbody = document.querySelector('#prayer-table tbody');
  const currentIndex = Number(localStorage.getItem('currentPrayerIndex')) || 0;
  
  tbody.innerHTML = people.map((person, index) => `
    <tr data-id="${person.id}" class="${index === currentIndex ? 'current-focus' : ''}">
      <td>
        <span class="display-text">${person.name}</span>
        <input type="text" class="edit-input hidden" value="${person.name}">
      </td>
      <td>
        <span class="display-text">${person.prayer}</span>
        <input type="text" class="edit-input hidden" value="${person.prayer}">
      </td>
      <td>
        <span class="display-text">${person.note || ''}</span>
        <input type="text" class="edit-input hidden" value="${person.note || ''}">
      </td>
      <td class="actions-cell">
        <div class="action-buttons">
          <div class="edit-image-container hidden">
            <input type="file" class="edit-image-input" accept="image/png, image/jpeg">
            <small class="image-hint">Choose new image (optional)</small>
          </div>
          <button class="edit-btn btn-icon" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="save-btn btn-icon hidden" title="Save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
          <button class="cancel-btn btn-icon hidden" title="Cancel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button class="delete-btn btn-icon" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Add edit handlers
  tbody.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;

    if (e.target.classList.contains('edit-btn')) {
      // Enter edit mode
      row.classList.add('editing');
      row.querySelectorAll('.display-text').forEach(el => el.classList.add('hidden'));
      row.querySelectorAll('.edit-input').forEach(el => el.classList.remove('hidden'));
      row.querySelector('.edit-image-container').classList.remove('hidden');
      row.querySelector('.edit-btn').classList.add('hidden');
      row.querySelectorAll('.save-btn, .cancel-btn').forEach(el => el.classList.remove('hidden'));
    }

    if (e.target.classList.contains('save-btn')) {
      // Save changes
      const id = row.dataset.id;
      const imageInput = row.querySelector('.edit-image-input');
      const updateData = {
        name: row.querySelector('.edit-input').value,
        prayer: row.querySelectorAll('.edit-input')[1].value,
        note: row.querySelectorAll('.edit-input')[2].value
      };

      // Add image if one was selected
      if (imageInput.files.length > 0) {
        updateData.image = imageInput.files[0];
      }

      try {
        await updatePerson(id, updateData);
        const people = await getPeople();
        renderPeopleList(people);
      } catch (error) {
        console.error('Failed to update:', error);
      }
    }

    if (e.target.classList.contains('cancel-btn')) {
      // Cancel edit mode
      const people = await getPeople();
      renderPeopleList(people);
    }

    if (e.target.closest('.delete-btn')) {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await deletePerson(row.dataset.id);
          const people = await getPeople();
          renderPeopleList(people);
        } catch (error) {
          console.error('Failed to delete:', error);
        }
      }
    }
  });
}

// Add new render function for answered prayers
function renderAnsweredPrayers(prayers) {
  const tbody = document.querySelector('#answered-table tbody');
  const existingHandler = tbody._clickHandler;
  if (existingHandler) {
    tbody.removeEventListener('click', existingHandler);
  }
  
  tbody.innerHTML = prayers.map(prayer => `
    <tr data-id="${prayer.id}">
      <td>${prayer.name}</td>
      <td>${prayer.prayer}</td>
      <td>${new Date(prayer.dateAnswered).toLocaleDateString()}</td>
      <td class="actions-cell">
        <div class="action-buttons">
          <button class="delete-btn btn-icon" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Create new click handler
  tbody._clickHandler = async (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;

    const row = deleteBtn.closest('tr');
    if (!row) return;

    try {
      if (confirm('Are you sure you want to delete this answered prayer? This cannot be undone.')) {
        await deleteAnsweredPrayer(row.dataset.id);
        const answeredPrayers = await getAnsweredPrayers();
        renderAnsweredPrayers(answeredPrayers);
      }
    } catch (error) {
      console.error('Failed to delete answered prayer:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  tbody.addEventListener('click', tbody._clickHandler);
}