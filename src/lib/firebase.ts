import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBuvzACt2LOHvLE9xg0i8xnsVEA0HGPMF4',
  authDomain: 'liam-87f2c.firebaseapp.com',
  projectId: 'liam-87f2c',
  storageBucket: 'liam-87f2c.firebasestorage.app',
  messagingSenderId: '485731830886',
  appId: '1:485731830886:web:b41f9dd70a77768df5b1a7',
  measurementId: 'G-SESP9P1MWH',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
