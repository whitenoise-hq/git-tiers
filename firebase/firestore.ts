import firebase from './firebase';
import { getFirestore } from 'firebase/firestore';

const fireStore = getFirestore(firebase);
export default fireStore;
