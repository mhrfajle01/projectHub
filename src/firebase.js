import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3wYFqIX3blucKutwvzFXUVPoWQ_QATG8",
  authDomain: "project-66b52.firebaseapp.com",
  projectId: "project-66b52",
  storageBucket: "project-66b52.firebasestorage.app",
  messagingSenderId: "791333722694",
  appId: "1:791333722694:web:b38815d076b4f0ae268847",
  measurementId: "G-3E69RTHTNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally to prevent breaking in non-browser/unsupported environments
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;