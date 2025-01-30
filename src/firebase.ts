// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore, collection, addDoc, getDocs, setDoc, doc} from "firebase/firestore"; 
import { getAuth } from 'firebase/auth';
import type { IUser } from "@/types/User";



const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);

export const getFirebaseAuth = ()=>{
  const auth = getAuth(app);
  return auth
}
const db = getFirestore(app)
export const getFirestoreDb = () =>{
  return db
}

export const createUser = async (user:IUser)=> {

  try {
    const docRef = await setDoc(doc(db, "Users", user.id), {
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      email: user.email
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const getCurrentUserId = ()=> {
  const auth = getAuth();
  const user = auth.currentUser;
  return user?.uid
}