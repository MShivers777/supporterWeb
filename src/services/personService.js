import { db, realtimeDb, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const addPerson = async (personData) => {
  try {
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'people'), personData);

    // Add to Realtime Database
    await set(ref(realtimeDb, `people/${docRef.id}`), personData);

    // If there's an image, upload to Storage
    if (personData.image) {
      const imageRef = storageRef(storage, `people/${docRef.id}`);
      await uploadBytes(imageRef, personData.image);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Update both databases with the image URL
      await set(ref(realtimeDb, `people/${docRef.id}/imageUrl`), imageUrl);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding person:', error);
    throw error;
  }
};
