import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useStore } from './store';
import { User, UserRole } from './types';
import { inspectionService } from './services/inspectionService';

const LOGIN_ROLE_KEY = 'tex-inspect-login-role';
const LOGIN_MODE_KEY = 'tex-inspect-login-mode';
const LOGIN_ERROR_KEY = 'tex-inspect-login-error';
const LOGIN_ERROR_EVENT = 'tex-inspect-login-error';
type LoginMode = 'SIGN_IN' | 'SIGN_UP';

class AdminAccessDeniedError extends Error {
  constructor() {
    super('Admin access denied');
    this.name = 'AdminAccessDeniedError';
  }
}

function setLoginError(message: string) {
  localStorage.setItem(LOGIN_ERROR_KEY, message);
  window.dispatchEvent(new Event(LOGIN_ERROR_EVENT));
}

async function resolveUser(firebaseUser: NonNullable<typeof auth.currentUser>): Promise<User> {
  const requestedRole = (localStorage.getItem(LOGIN_ROLE_KEY) as UserRole | null) || 'INSPECTOR';
  const loginMode = (localStorage.getItem(LOGIN_MODE_KEY) as LoginMode | null) || 'SIGN_IN';
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const existingUser = snapshot.exists() ? (snapshot.data() as User) : null;

  if (!existingUser && loginMode === 'SIGN_IN') {
    setLoginError('No account found for this Google login. Please use first-time signup.');
    await auth.signOut();
    throw new AdminAccessDeniedError();
  }

  if (requestedRole === 'ADMIN' && existingUser?.role !== 'ADMIN') {
    setLoginError('This account is not listed as an admin in Firebase.');
    localStorage.setItem(LOGIN_ROLE_KEY, 'INSPECTOR');
    await auth.signOut();
    throw new AdminAccessDeniedError();
  }

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
  localStorage.setItem(LOGIN_MODE_KEY, 'SIGN_IN');
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
            if (error instanceof AdminAccessDeniedError) {
              setCurrentUser(null);
              setInspections([]);
              return;
            }

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
