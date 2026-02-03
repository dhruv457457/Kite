'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createConfig, EVM } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import type { Config } from 'wagmi';

interface LifiContextValue {
    isInitialized: boolean;
    error: Error | null;
}

const LifiContext = createContext<LifiContextValue | null>(null);

/**
 * Hook to access LI.FI initialization status
 */
export function useLifi(): LifiContextValue {
    const context = useContext(LifiContext);
    if (!context) {
        throw new Error('useLifi must be used within LifiProvider');
    }
    return context;
}

/**
 * LifiProvider with Wagmi integration
 * 
 * ✅ CRITICAL FIX: In LI.FI SDK v3, you MUST configure providers in createConfig
 * You cannot pass a signer to executeRoute - the SDK gets the wallet from providers
 */
export function LifiProvider({
    children,
    wagmiConfig
}: {
    children: ReactNode;
    wagmiConfig: Config;
}) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        try {
            // ✅ Configure LI.FI SDK with EVM provider using Wagmi
            createConfig({
                integrator: 'kite-app',
                apiUrl: 'https://li.quest/v1',
                providers: [
                    EVM({
                        // ✅ Use Wagmi's getWalletClient to get the active wallet
                        getWalletClient: async () => {
                            const walletClient = await getWalletClient(wagmiConfig);
                            if (!walletClient) {
                                throw new Error('No wallet connected');
                            }
                            return walletClient as any;
                        },
                        // ✅ Use Wagmi's switchChain for chain switching
                        switchChain: async (chainId: number) => {
                            await switchChain(wagmiConfig, { chainId });
                            // Return the new wallet client after switching
                            const walletClient = await getWalletClient(wagmiConfig);
                            if (!walletClient) {
                                throw new Error('Failed to get wallet client after chain switch');
                            }
                            return walletClient as any;
                        },
                    }),
                ],
            });

            setIsInitialized(true);
            console.log('✅ LI.FI SDK V3 Configured Successfully with Wagmi Provider');
        } catch (err) {
            const error = err instanceof Error ? err : new Error('LI.FI initialization failed');
            console.error('❌ LI.FI SDK initialization error:', error);
            setError(error);
        }
    }, [wagmiConfig]);

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