import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LOGIN_ERROR_EVENT, LOGIN_ERROR_KEY, LOGIN_MODE_KEY, LOGIN_ROLE_KEY, type LoginMode } from '../../features/auth/constants';
import type { User, UserRole } from '../../types';
import { auth, db } from './client';

export class AdminAccessDeniedError extends Error {
  constructor() {
    super('Admin access denied');
    this.name = 'AdminAccessDeniedError';
  }
}

function setLoginError(message: string) {
  localStorage.setItem(LOGIN_ERROR_KEY, message);
  window.dispatchEvent(new Event(LOGIN_ERROR_EVENT));
}

export async function resolveUser(firebaseUser: NonNullable<typeof auth.currentUser>): Promise<User> {
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

