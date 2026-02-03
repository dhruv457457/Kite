'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { lifiConfig } from '@/lib/lifi/config';

interface LifiContextValue {
    isInitialized: boolean;
    error: Error | null;
}

const LifiContext = createContext<LifiContextValue | null>(null);

/**
 * Hook to access LI.FI initialization status
 * 
 * Note: In V3, you don't get a "lifi instance" from this hook.
 * Instead, import functions directly from '@lifi/sdk':
 * - import { getRoutes, executeRoute, getTokens } from '@lifi/sdk'
 */
export function useLifi(): LifiContextValue {
    const context = useContext(LifiContext);
    if (!context) {
        throw new Error('useLifi must be used within LifiProvider');
    }
    return context;
}

/**
 * LifiProvider ensures the LI.FI SDK is configured on the client side
 * 
 * In V3, createConfig is called once globally, and all functions
 * (getRoutes, executeRoute, etc.) are imported directly from '@lifi/sdk'
 */
export function LifiProvider({ children }: { children: ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        try {
            // Simply accessing lifiConfig (which calls createConfig) initializes it
            if (lifiConfig) {
                setIsInitialized(true);
                console.log('✅ LI.FI SDK V3 Configured Successfully');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('LI.FI initialization failed');
            console.error('❌ LI.FI SDK initialization error:', error);
            setError(error);
        }
    }, []);

    const value: LifiContextValue = {
        isInitialized,
        error,
    };

    return (
        <LifiContext.Provider value={value}>
            {children}
        </LifiContext.Provider>
    );
}