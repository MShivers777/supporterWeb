import { db, database, storage, auth } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const addPerson = async (personData) => {
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
