import { db, realtimeDb, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeDebugger } from './debug-utils';
initializeDebugger();

export const addPerson = async (personData) => {
  console.group('📝 Adding New Person');
  console.log('Input Data:', personData);
  
  try {
    // Add to Firestore
    console.log('📌 Adding to Firestore...');
    const docRef = await addDoc(collection(db, 'people'), personData);
    console.log('✅ Firestore document created:', docRef.id);

    // Add to Realtime Database
    console.log('📌 Adding to Realtime Database...');
    await set(ref(realtimeDb, `people/${docRef.id}`), personData);
    console.log('✅ Realtime Database updated');

    // If there's an image, upload to Storage
    if (personData.image) {
      console.log('📌 Uploading image to Storage...');
      const imageRef = storageRef(storage, `people/${docRef.id}`);
      await uploadBytes(imageRef, personData.image);
      const imageUrl = await getDownloadURL(imageRef);
      console.log('✅ Image uploaded, URL:', imageUrl);
      
      // Update both databases with the image URL
      await set(ref(realtimeDb, `people/${docRef.id}/imageUrl`), imageUrl);
      console.log('✅ Database updated with image URL');
    }

    console.log('✅ All operations completed successfully');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding person:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

// Add debugging helper
export const debugFirebaseConnection = () => {
  console.group('🔍 Firebase Connection Debug');
  console.log('Firestore instance:', !!db);
  console.log('Realtime Database instance:', !!realtimeDb);
  console.log('Storage instance:', !!storage);
  console.groupEnd();
};
