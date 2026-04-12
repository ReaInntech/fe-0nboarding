'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/src/components/shared/molecule/LoginForm';
import { useApp } from '@/src/context/AppContext';

export default function LoginPage() {
    const { user, setUser, isLoading } = useApp();
    const router = useRouter();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    const handleEmailAuth = async (email: string, password: string, isSignUp: boolean) => {
        // Mock authentication for now, as the real Firebase integrated auth 
        // will be handled by the services. 
        // We update the AppContext which persists to localStorage.
        
        // Simulating a small delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (email && password) {
            const mockUser = {
                id: 'usr-' + Math.random().toString(36).substr(2, 9),
                name: email.split('@')[0],
                email: email,
                role: 'client',
                clientType: 'natural_person' as const,
                photoUrl: 'https://i.pravatar.cc/150'
            };
            setUser(mockUser);
            router.push('/dashboard');
        }
    };

    const handleGoogleLogin = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
            id: 'google-123',
            name: 'Google User',
            email: 'user@gmail.com',
            role: 'client',
            clientType: 'legal_entity' as const,
            photoUrl: 'https://i.pravatar.cc/150?u=google'
        };
        setUser(mockUser);
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f1523]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If user is already resolved and present, the useEffect will handle redirect.
    // We show nothing or a loader while that happens to prevent flashing the login form.
    if (user) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f1523] p-4">
            <div className="w-full max-w-md">
                <LoginForm 
                    onEmailAuth={handleEmailAuth}
                    onGoogleLogin={handleGoogleLogin}
                />
            </div>
        </div>
    );
}
