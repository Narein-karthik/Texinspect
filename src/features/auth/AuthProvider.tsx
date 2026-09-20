import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect } from 'react';
import { auth } from '../../services/firebase/client';
import { inspectionService } from '../../services/firebase/inspectionService';
import { useStore } from '../../store';

import { AdminAccessDeniedError, resolveUser } from '../../services/firebase/accountService';

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
