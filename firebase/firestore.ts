import firebase from './firebase';
import { getFirestore } from 'firebase/firestore';

const fireStore = firebase ? getFirestore(firebase) : (null as any);
export default fireStore;
