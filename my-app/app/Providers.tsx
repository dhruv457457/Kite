'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { LifiProvider } from '@/components/providers/LifiProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// ✅ Create QueryClient OUTSIDE component to prevent recreation on every render
const queryClient = new QueryClient();

/**
 * Combined providers component that properly nests all providers
 * 
 * ✅ CRITICAL ORDER - DO NOT CHANGE:
 * 1. QueryClientProvider (required by Wagmi and React Query)
 * 2. WagmiProvider (wallet connection)
 * 3. RainbowKitProvider (wallet UI)
 * 4. LifiProvider (needs wagmiConfig from above)
 * 5. ToastProvider (UI notifications)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#06b6d4',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <LifiProvider wagmiConfig={config}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LifiProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}