import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔥 Add this

const firebaseConfig = {
  apiKey: "AIzaSyAHBGoclydfiKPzKqKdWfmoP-HvxPqlZu4",
  authDomain: "legalbuddy-1215d.firebaseapp.com",
  projectId: "legalbuddy-1215d",
  storageBucket: "legalbuddy-1215d.firebasestorage.app",
  messagingSenderId: "223107859574",
  appId: "1:223107859574:web:a7c445a7989a86d75a0b57"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const db = getFirestore(app); // 🔥 Export Firestore
