import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from '../../types';
import { db } from './client';

export async function saveProfileName(user: FirebaseUser, currentUser: User, trimmedName: string) {
  await updateProfile(user, { displayName: trimmedName });
  await setDoc(
    doc(db, 'users', user.uid),
    {
      id: user.uid,
      name: trimmedName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: currentUser.role,
      factoryId: currentUser.factoryId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

}
