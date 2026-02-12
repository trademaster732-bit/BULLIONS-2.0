
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { db, auth } from '@/firebase';
import { getApp, getApps } from 'firebase/app';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [servicesReady, setServicesReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setServicesReady(true);
    }
  }, []);


  if (!servicesReady) {
    return null; 
  }

  const firebaseApp = getApps()[0];

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth!}
      firestore={db!}
    >
      {children}
    </FirebaseProvider>
  );
}
