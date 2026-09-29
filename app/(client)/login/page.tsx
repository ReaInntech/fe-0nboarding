'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '@/src/lib/firebase/config';
import LoginForm from '@/src/components/shared/molecule/LoginForm';
import { useApp } from '@/src/context/AppContext';

export default function LoginPage() {
    const { user, isLoading } = useApp();
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    const handleEmailAuth = async (email: string, password: string, isSignUp: boolean) => {
        setAuthError(null);
        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log('[LoginPage] Sign up success');
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log('[LoginPage] Sign in success');
            }

            // Sync server session cookies immediately to avoid race conditions with SSR
            try {
                const token = await userCredential.user.getIdToken();
                const { createSession } = await import('@/src/lib/firebase/auth-actions');
                await createSession(token);
            } catch (err) {
                console.warn('[LoginPage] Immediate session sync failed, fallback to AppContext listener', err);
            }
        } catch (err: any) {
            console.error('[LoginPage] Auth error:', err);
            let message = 'Authentication failed.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                message = 'Invalid email or password.';
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Password should be at least 6 characters.';
            }
            setAuthError(message);
            throw new Error(message);
        }
    };

    const handleGoogleLogin = async () => {
        setAuthError(null);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            console.log('[LoginPage] Google sign in success');
            try {
                const token = await userCredential.user.getIdToken();
                const { createSession } = await import('@/src/lib/firebase/auth-actions');
                await createSession(token);
            } catch (err) {
                console.warn('[LoginPage] Google immediate session sync failed', err);
            }
            router.push('/dashboard');
        } catch (err: any) {
            console.error('[LoginPage] Google login error:', err);
            setAuthError('Failed to login with Google.');
            throw err;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f1523]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If user is already resolved and present, the useEffect will handle redirect.
    if (user) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f1523] p-4">
            <div className="w-full max-w-md">
                <LoginForm 
                    onEmailAuth={handleEmailAuth}
                    onGoogleLogin={handleGoogleLogin}
                />
                {authError && (
                    <p className="mt-4 text-center text-red-500 text-sm">{authError}</p>
                )}
            </div>
        </div>
    );
}
