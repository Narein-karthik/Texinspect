import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store';
import { User } from './types';
import { inspectionService } from './services/inspectionService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setInspections = useStore((state) => state.setInspections);
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Inspector',
          role: 'INSPECTOR',
          factoryId: 'factory-1'
        };
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setInspections([]);
      }
    });

    return () => unsubscribeAuth();
  }, [setCurrentUser, setInspections]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribeInspections = inspectionService.subscribeToInspections(currentUser.id, (data) => {
      setInspections(data);
    });

    return () => unsubscribeInspections();
  }, [currentUser?.id, setInspections]);

  return <>{children}</>;
}
