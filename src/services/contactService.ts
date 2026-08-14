import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ContactRequestInput {
  name: string;
  email: string;
  company: string;
  message: string;
}

export const submitContactRequest = async (request: ContactRequestInput) => {
  await addDoc(collection(db, 'contactRequests'), {
    ...request,
    createdAt: serverTimestamp(),
  });
};
