import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  db,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  User,
} from '../lib/firebase';
import { AppState } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'unauthenticated' | 'error';

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  syncStatus: SyncStatus;
  lastSyncedTime: Date | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  syncStateToCloud: (state: AppState) => Promise<void>;
  cloudState: AppState | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unauthenticated');
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [cloudState, setCloudState] = useState<AppState | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);

      if (user) {
        setSyncStatus('syncing');
        // Setup Firestore listener for user data document
        const userDocRef = doc(db, 'users', user.uid);

        const unsubDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.appData) {
                setCloudState(data.appData as AppState);
              }
              setSyncStatus('synced');
              setLastSyncedTime(new Date());
            } else {
              // User document doesn't exist yet in Firestore
              setSyncStatus('synced');
            }
          },
          (err) => {
            console.error('Firestore snapshot listener error:', err);
            setSyncStatus('error');
          }
        );

        return () => unsubDoc();
      } else {
        setCloudState(null);
        setSyncStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setSyncStatus('syncing');
      await signInWithEmailAndPassword(auth, email, pass);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      setSyncStatus('syncing');
      await createUserWithEmailAndPassword(auth, email, pass);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  const signInAsGuest = async () => {
    try {
      setSyncStatus('syncing');
      await signInAnonymously(auth);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCloudState(null);
      setSyncStatus('unauthenticated');
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      throw err;
    }
  };

  const syncStateToCloud = async (state: AppState) => {
    if (!currentUser) return;

    try {
      setSyncStatus('syncing');
      const userDocRef = doc(db, 'users', currentUser.uid);

      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          email: currentUser.email || 'guest@craftsman.hub',
          displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Guest Craftsman' : 'User'),
          photoURL: currentUser.photoURL || '',
          lastSyncedAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
          appData: state,
        },
        { merge: true }
      );

      setSyncStatus('synced');
      setLastSyncedTime(new Date());
    } catch (err: any) {
      console.error('Error uploading state to cloud:', err);
      setSyncStatus('error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loadingAuth,
        syncStatus,
        lastSyncedTime,
        showAuthModal,
        setShowAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        logout,
        syncStateToCloud,
        cloudState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
