import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDhOi9M9pRSnTDTTzUv2yYNN8DRYVaK1qY",
  authDomain: "buildingreports-a11d7.firebaseapp.com",
  projectId: "buildingreports-a11d7",
  storageBucket: "buildingreports-a11d7.firebasestorage.app",
  messagingSenderId: "238506273876",
  appId: "1:238506273876:web:295df58bc34202da3311c1",
  measurementId: "G-YK9D92WB0M"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);