import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useStore } from './store';
import { User, UserRole } from './types';
import { inspectionService } from './services/inspectionService';

const LOGIN_ROLE_KEY = 'tex-inspect-login-role';

async function resolveUser(firebaseUser: NonNullable<typeof auth.currentUser>): Promise<User> {
  const requestedRole = (localStorage.getItem(LOGIN_ROLE_KEY) as UserRole | null) || 'INSPECTOR';
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const existingUser = snapshot.exists() ? (snapshot.data() as User) : null;
  const role: UserRole = existingUser?.role === 'ADMIN' && requestedRole === 'ADMIN'
    ? 'ADMIN'
    : 'INSPECTOR';

  const user: User = {
    id: firebaseUser.uid,
    name: existingUser?.name || firebaseUser.displayName || 'Inspector',
    role,
    factoryId: existingUser?.factoryId || 'factory-1'
  };

  if (!existingUser) {
    await setDoc(userRef, {
      ...user,
      role: 'INSPECTOR',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(LOGIN_ROLE_KEY, role);
  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setInspections = useStore((state) => state.setInspections);
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        resolveUser(firebaseUser)
          .then(setCurrentUser)
          .catch((error) => {
            console.error('Unable to resolve user profile', error);
            setCurrentUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Inspector',
              role: 'INSPECTOR',
              factoryId: 'factory-1'
            });
          });
      } else {
        setCurrentUser(null);
        setInspections([]);
      }
    });

    return () => unsubscribeAuth();
  }, [setCurrentUser, setInspections]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribeInspections = currentUser.role === 'ADMIN'
      ? inspectionService.subscribeToAllInspections((data) => {
          setInspections(data);
        })
      : inspectionService.subscribeToInspections(currentUser.id, (data) => {
          setInspections(data);
        });

    return () => unsubscribeInspections();
  }, [currentUser?.id, currentUser?.role, setInspections]);

  return <>{children}</>;
}
