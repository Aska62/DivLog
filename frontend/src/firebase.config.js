// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZi6e2nSmB3FYgzKVROgVVL6d45eJUeys",
  authDomain: "moguru-df0bd.firebaseapp.com",
  projectId: "moguru-df0bd",
  storageBucket: "moguru-df0bd.appspot.com",
  messagingSenderId: "202382882304",
  appId: "1:202382882304:web:3c3fb3ea7bcaa844c78ae5",
  measurementId: "G-L6S374BC61"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const analytics = getAnalytics(app);