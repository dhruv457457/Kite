import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains } from '@/lib/chains/config';

export const config = getDefaultConfig({
  appName: 'Kite',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: supportedChains,
  ssr: true,
});