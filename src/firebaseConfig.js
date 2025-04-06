import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCZYHRCigIAkEu5rSt9kgOekv7EU0TJXMM",
  authDomain: "site-7feec.firebaseapp.com",
  projectId: "site-7feec",
  storageBucket: "site-7feec.appspot.com", // 🔥 Fixed storageBucket typo
  messagingSenderId: "688137825363",
  appId: "1:688137825363:web:1295acf525eb767c516aa6",
  measurementId: "G-8P1JEP1RSH"
};

// ✅ Prevent multiple Firebase initializations
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };