import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr2ZNTljvRD_IqFnOvj9CzpiFgpp-meZc",
  authDomain: "textcraft-13e92.firebaseapp.com",
  projectId: "textcraft-13e92",
  storageBucket: "textcraft-13e92.appspot.com",
  messagingSenderId: "1096374552545",
  appId: "1:1096374552545:web:427cb6f275ca1e390ff4a0",
  databaseURL: 'https://textcraft-13e92-default-rtdb.firebaseio.com'
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Firebase Context
const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

// Firebase Provider Component
export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);

  // Signup Function
  const signupUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Store user email in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(), // Optional: store creation time
      });

      console.log("User signed up and email stored in Firestore:", user.email);
      return user; // Return the user object
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; // Throw error for handling in the calling component
    }
  };

  // Login Function
  const loginUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
  
      // Fetch user email from Firestore
      const userDocRef = doc(db, "users", user.uid); // Use doc() to reference the document
      const userDoc = await getDoc(userDocRef); // Use getDoc() for a single document
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User logged in and fetched email from Firestore:", userData.email);
        return userData; // Return user data, including email
      } else {
        console.error("No such user document!");
        return null; // Handle no document case
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error; // Throw error for handling in the calling component
    }
  };
  

  // Get Current User
  const getUser = () => {
    return user;
  };

  // Logout Function
  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null); // Clear user state on logout
  };

  // Fetch User History Function
  const fetchUserHistory = async (userId) => {
    try {
      const historyRef = collection(db, `users/${userId}/history`);
      const historySnapshot = await getDocs(historyRef);
      const historyList = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(), // Spread the document data
      }));

      historyList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      
      return historyList;
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  };

// Add History Entry Function
// const addHistoryEntry = async (userId, actionType, actionData) => {
//   try {
//       const historyRef = collection(db, `users/${userId}/history`);
      
//       // Store the action type and data
//       await addDoc(historyRef, {
//           actionType,
//           actionData,
//           createdAt: serverTimestamp(), // Timestamp for the entry
//       });

//       console.log("History entry added successfully!");
//   } catch (error) {
//       console.error("Error adding history entry:", error);
//       throw error; // Rethrow the error for handling in the calling component
//   }
// };

const addHistoryEntry = async (userId, actionType, actionData) => {
  if (!userId) {
    console.error("No userId provided.");
    throw new Error("User must be logged in to add history.");
  }

  try {
    console.log(`Adding history for user: ${userId}`);
    const historyRef = collection(db, `users/${userId}/history`);
    await addDoc(historyRef, {
      actionType,
      actionData,
      createdAt: serverTimestamp(),
    });

    console.log("History entry added successfully!");
  } catch (error) {
    console.error("Error adding history entry:", error.message);
    throw error;
  }
};




  // Upload Document Function
  const uploadImageDocument = async (file) => {
    const currentUser = firebaseAuth.currentUser;

    // Ensure a user is logged in
    if (!currentUser) {
      console.error("No user logged in");
      return null; // Return null if no user is logged in
    }

    const userId = currentUser.uid;
    const storageRef = ref(storage, `documents/${userId}/${file.name}`);

    try {
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL after upload
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Store the document metadata in Firestore
      await addDoc(collection(db, "users", userId, "documents"), {
        fileName: file.name,
        downloadURL: downloadURL, // Storing the download URL
        uploadedAt: serverTimestamp(), // Record the time of upload
      });

      console.log("Document uploaded and URL generated successfully!");
      return downloadURL; // Return the download URL
    } catch (error) {
      // Log the error if something goes wrong
      console.error("Error uploading document or fetching URL:", error);
      return null; // Return null in case of error
    }
  };

  // Fetch Documents Function
  const getDocuments = async () => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return [];
    }

    const userId = currentUser.uid;
    const docsRef = collection(db, "users", userId, "documents");

    try {
      const snapshot = await getDocs(docsRef);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return documents; // Return list of documents
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };


// Function to upload a document
 const uploadSummaryDocument = async (file, userId) => {
  const fileRef = collection(db, `users/${userId}/files`);
  const docRef = await addDoc(fileRef, {
    fileName: file.name,
    fileType: file.type,
    createdAt: new Date(),
  });

  // You may also want to upload the file to Firebase Storage and get the download URL
  const storageRef = ref(storage, `files/${docRef.id}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return docRef.id; // Return the document ID if needed
};

// Function to fetch the latest document
 const fetchLatestSummaryDocument = async (userId) => {
  const fileRef = collection(db, `users/${userId}/files`);
  const q = query(fileRef, orderBy('createdAt', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const latestDoc = querySnapshot.docs[0].data();
    return latestDoc; // Return the latest document data
  }
  return null; // Return null if no documents are found
};

const deleteHistoryItem = async (itemId) => {
  const user = getUser();
  if (user) {
    // Create a reference to the specific document in the history collection
    const docRef = doc(db, `users/${user.uid}/history`, itemId); // Correctly reference the document
    await deleteDoc(docRef); // Delete the specific history item
    console.log("History item deleted successfully:", itemId); // Optional: log success
  } else {
    throw new Error("No user is logged in.");
  }
};


const clearUserHistory = async () => {
  const user = getUser();
  if (user) {
    const historyRef = collection(db, `users/${user.uid}/history`); // Corrected here
    const snapshot = await getDocs(historyRef);
    const batch = writeBatch(db); // Use writeBatch for batch processing
    snapshot.forEach(doc => {
      batch.delete(doc.ref); // Queue up each delete for batch processing
    });
    await batch.commit(); // Commit all deletes at once
  } else {
    throw new Error("No user is logged in.");
  }
};



  
 

  // Set up Firebase auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user); // Update the user state
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  


  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        loginUserWithEmailAndPassword,
        getUser,
        logout,
        uploadImageDocument,
        getDocuments,
        fetchUserHistory,
        addHistoryEntry,
        uploadSummaryDocument,
        fetchLatestSummaryDocument,
        deleteHistoryItem,
        clearUserHistory,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};

export  { firebaseAuth, db, storage };

