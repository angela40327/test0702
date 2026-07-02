import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXquIa08Busoznuh4p3Ui-8KIKd8RRnp8",
  authDomain: "heroic-rhythm-rtgzl.firebaseapp.com",
  projectId: "heroic-rhythm-rtgzl",
  storageBucket: "heroic-rhythm-rtgzl.firebasestorage.app",
  messagingSenderId: "1027401662462",
  appId: "1:1027401662462:web:a2ede00a431fff0fc3caaf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
