// Firebase initialization — shared by every page that needs auth.
//
// Replace the values below with YOUR project's config, found at:
// Firebase Console > Project settings (gear icon) > General tab > "Your apps" > SDK setup and configuration
//
// See the setup walkthrough the assistant provided in chat for step-by-step instructions.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyxErjZ5t5DHWDFsIX6x6hIlE5zyfyxx4",
  authDomain: "lesson-lector.firebaseapp.com",
  projectId: "lesson-lector",
  storageBucket: "lesson-lector.firebasestorage.app",
  messagingSenderId: "580641122574",
  appId: "1:580641122574:web:846f4ffc6480694a368f5f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
