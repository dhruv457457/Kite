import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, base, arbitrum, polygon } from 'wagmi/chains';

/**
 * Supported chains for Kite
 */
export const supportedChains = [mainnet, base, arbitrum, polygon] as const;

/**
 * Wagmi configuration using your existing env variables
 * 
 * Your env variables contain full Alchemy URLs, so we use them directly
 */
export const config = getDefaultConfig({
  appName: 'Kite',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: supportedChains,
  ssr: true,

  // ✅ Use your existing env variables (which contain full Alchemy URLs)
  transports: {
    // Ethereum Mainnet - using your ETHERSCAN_API_KEY variable (which is actually an Alchemy URL)
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || undefined
    ),

    // Base - using your BASESCAN_API_KEY variable (which is actually an Alchemy URL)
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASESCAN_API_KEY || undefined
    ),

    // Arbitrum - using your ARBISCAN_API_KEY variable (which is actually an Alchemy URL)
    [arbitrum.id]: http(
      process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || undefined
    ),

    // Polygon - using your POLYGONSCAN_API_KEY variable (which is actually an Alchemy URL)
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || undefined
    ),
  },
});