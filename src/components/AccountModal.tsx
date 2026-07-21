import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppState } from '../types';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Mail,
  Lock,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Globe,
  Sparkles,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, currentState }) => {
  const {
    currentUser,
    syncStatus,
    lastSyncedTime,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    logout,
    syncStateToCloud,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await signInWithGoogle();
      setSuccessMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password.trim());
        setSuccessMessage('Signed in successfully!');
      } else {
        await signUpWithEmail(email.trim(), password.trim());
        setSuccessMessage('Account created and synced successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await signInAsGuest();
      setSuccessMessage('Signed in as Guest!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start guest session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSubmitting(true);
      await syncStateToCloud(currentState);
      setSuccessMessage('Cloud state forced sync complete!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage('Sync failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#27272a] w-full max-w-md rounded-lg shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#27272a] bg-[#1c1c21] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-wide">Multi-Device Cloud Account</h2>
              <p className="text-[10px] text-[#a1a1aa] font-mono">Sync study metrics across laptops, phones & tabs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* IF LOGGED IN */}
          {currentUser ? (
            <div className="space-y-4">
              {/* Account details card */}
              <div className="bg-[#09090b] border border-[#27272a] rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-blue-500/40"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'G'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {currentUser.displayName || (currentUser.isAnonymous ? 'Guest Craftsman' : 'User')}
                        </span>
                        {currentUser.isAnonymous && (
                          <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded font-mono uppercase">
                            Guest
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#71717a] font-mono truncate max-w-[200px]">
                        {currentUser.email || currentUser.uid}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      syncStatus === 'synced'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : syncStatus === 'syncing'
                        ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 animate-pulse'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        syncStatus === 'synced'
                          ? 'bg-green-400'
                          : syncStatus === 'syncing'
                          ? 'bg-blue-400'
                          : 'bg-red-400'
                      }`}
                    />
                    {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#27272a] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#a1a1aa]">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Multi-Device Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span>Firestore Rules Enforced</span>
                  </div>
                </div>

                {lastSyncedTime && (
                  <p className="text-[9px] text-[#71717a] font-mono text-right">
                    Last Cloud Sync: {lastSyncedTime.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-2 px-4 rounded border border-blue-400/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>Force Sync Local Data To Cloud</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full bg-[#09090b] hover:bg-red-950/20 text-[#a1a1aa] hover:text-red-400 font-mono text-xs py-2 px-4 rounded border border-[#27272a] hover:border-red-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* IF NOT LOGGED IN */
            <div className="space-y-4">
              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-2.5 px-4 rounded shadow flex items-center justify-center gap-3 text-xs transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.21v3.15C3.2 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.21C.44 8.12 0 9.99 0 12s.44 3.88 1.21 5.42l4.07-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.2 2.7 1.21 6.58l4.07 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#27272a] w-full" />
                <span className="bg-[#18181b] px-3 text-[10px] text-[#71717a] font-mono uppercase font-bold shrink-0">
                  Or email account
                </span>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex bg-[#09090b] p-1 rounded border border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded font-bold transition cursor-pointer ${
                    mode === 'signin' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded font-bold transition cursor-pointer ${
                    mode === 'signup' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#71717a] font-mono font-bold uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@craftsman.io"
                      required
                      className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#52525b] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#71717a] font-mono font-bold uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#52525b] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-2 px-4 rounded border border-blue-400/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span>{mode === 'signin' ? 'Sign In to Sync' : 'Create Account & Sync'}</span>
                </button>
              </form>

              <div className="pt-2 border-t border-[#27272a] text-center">
                <button
                  onClick={handleGuestSignIn}
                  disabled={isSubmitting}
                  className="text-[11px] text-[#a1a1aa] hover:text-white font-mono underline transition cursor-pointer"
                >
                  Continue as Guest (Temporary local session)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
