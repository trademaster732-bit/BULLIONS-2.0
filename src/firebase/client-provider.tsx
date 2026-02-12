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
    // This effect runs only on the client.
    // When it runs, we know that the client-side `db` and `auth` from firebase/index.ts are available.
    if (db && auth) {
      setServicesReady(true);
    }
  }, []);


  if (!servicesReady) {
    // On the server or during the initial client render before the effect runs,
    // you can return a loader or null. This prevents the provider from getting null services.
    return null;
  }

  // getApps()[0] should exist if services are ready.
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
