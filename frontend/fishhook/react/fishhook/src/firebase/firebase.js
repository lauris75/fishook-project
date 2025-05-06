import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyA7HjYbDb7ux6aYHhZyE5H22eO6HM1cFuQ",
  authDomain: "fishhook-6fbbc.firebaseapp.com",
  projectId: "fishhook-6fbbc",
  storageBucket: "fishhook-6fbbc.firebasestorage.app",
  messagingSenderId: "756196258749",
  appId: "1:756196258749:web:660583deded0b269aa18d4"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };