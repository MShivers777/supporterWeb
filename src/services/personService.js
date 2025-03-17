import { db, database, storage, auth } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Add function to ensure user document exists
const ensureUserDocument = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      currentPrayerIndex: 0,
      createdAt: new Date().toISOString()
    });
  }
  return userRef;
};

export const addPerson = async (personData) => {
  if (!auth.currentUser) throw new Error('User must be authenticated');
  try {
    // Create a clean copy of data without the image
    const dbData = {
      ...personData,
      userId: auth.currentUser.uid,
      imageUrl: null
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'people'), dbData);
    console.log('Firestore document created:', docRef.id);

    // Add to Realtime Database
    await set(ref(database, `people/${docRef.id}`), dbData);
    console.log('Realtime Database updated');

    // If there's an image, upload to Storage
    if (personData.image) {
      const imageRef = storageRef(storage, `people/${docRef.id}`);
      await uploadBytes(imageRef, personData.image);
      const imageUrl = await getDownloadURL(imageRef);
      console.log('Image uploaded, URL:', imageUrl);
      
      // Update both databases with the image URL
      await set(ref(database, `people/${docRef.id}/imageUrl`), imageUrl);
      console.log('Database updated with image URL');
    }

    // After adding person, ensure user document exists
    await ensureUserDocument(auth.currentUser.uid);
    return docRef.id;
  } catch (error) {
    console.error('Error adding person:', error);
    throw error;
  }
};

export const getPeople = async () => {
  const peopleRef = collection(db, 'people');
  const q = query(peopleRef, where("userId", "==", auth.currentUser.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updatePerson = async (id, updateData) => {
  try {
    const docRef = doc(db, 'people', id);
    await updateDoc(docRef, updateData);
    await set(ref(database, `people/${id}`), updateData);
    return id;
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
};

export const deletePerson = async (id) => {
  if (!auth.currentUser) throw new Error('User must be authenticated');
  
  try {
    // Get the document first to verify ownership
    const docRef = doc(db, 'people', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }
    
    // Verify ownership
    if (docSnap.data().userId !== auth.currentUser.uid) {
      throw new Error('Permission denied');
    }
    
    // Delete from Firestore first
    await deleteDoc(docRef);
    
    // Delete from Realtime Database
    await set(ref(database, `people/${id}`), null);
    
    // Try to delete image from storage if it exists
    if (docSnap.data().imageUrl) {
      try {
        const imageRef = storageRef(storage, `people/${id}`);
        await deleteObject(imageRef).catch(() => {
          // Silently fail if image doesn't exist or can't be deleted
          console.log('Image may not exist or already deleted');
        });
      } catch (storageError) {
        // Don't let storage errors prevent the delete operation
        console.warn('Failed to delete image, but document was removed:', storageError);
      }
    }
    
    return id;
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
};

export const getAnsweredPrayers = async () => {
  if (!auth.currentUser) return [];
  const answeredRef = collection(db, 'answered_prayers');
  const q = query(answeredRef, where("userId", "==", auth.currentUser.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const markPrayerAsAnswered = async (personId) => {
  try {
    // Get the person's data
    const personRef = doc(db, 'people', personId);
    const personSnap = await getDoc(personRef);
    
    if (!personSnap.exists()) {
      throw new Error('Person not found');
    }
    
    const personData = personSnap.data();

    // Add to answered prayers
    const answeredData = {
      ...personData,
      dateAnswered: new Date().toISOString(),
      userId: auth.currentUser.uid
    };
    await addDoc(collection(db, 'answered_prayers'), answeredData);

    // Delete from active prayers
    await deletePerson(personId);

    return true;
  } catch (error) {
    console.error('Error marking prayer as answered:', error);
    throw error;
  }
};

export const getCurrentPrayerIndex = async () => {
  if (!auth.currentUser) return 0;
  const userRef = await ensureUserDocument(auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  return userDoc.data()?.currentPrayerIndex || 0;
};

export const updateCurrentPrayerIndex = async (index) => {
  if (!auth.currentUser) return;
  const userRef = await ensureUserDocument(auth.currentUser.uid);
  await updateDoc(userRef, { currentPrayerIndex: index });
};

export const deleteAnsweredPrayer = async (id) => {
  try {
    await deleteDoc(doc(db, 'answered_prayers', id));
    return id;
  } catch (error) {
    console.error('Error deleting answered prayer:', error);
    throw error;
  }
};
