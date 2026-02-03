import { createConfig, getTokens, type ChainId, type Token } from '@lifi/sdk';

/**
 * Custom RPC URLs for each supported chain
 * Falls back to public RPCs if Alchemy keys are not provided
 */
const RPC_URLS: Record<number, string> = {
    // Ethereum Mainnet
    1: process.env.NEXT_PUBLIC_ALCHEMY_KEY_ETHEREUM
        ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY_ETHEREUM}`
        : 'https://rpc.ankr.com/eth',
    // Base
    8453: process.env.NEXT_PUBLIC_ALCHEMY_KEY_BASE
        ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY_BASE}`
        : 'https://mainnet.base.org',
    // Arbitrum
    42161: process.env.NEXT_PUBLIC_ALCHEMY_KEY_ARBITRUM
        ? `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY_ARBITRUM}`
        : 'https://arb1.arbitrum.io/rpc',
    // Polygon
    137: process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON
        ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON}`
        : 'https://polygon-rpc.com',
};

/**
 * Supported chain IDs for Kite
 */
export const SUPPORTED_CHAINS: ChainId[] = [1, 8453, 42161, 137];

/**
 * LI.FI SDK Configuration
 * 
 * Initialize the LI.FI SDK globally using V3 pattern.
 * This setup happens once and is shared by all functions.
 * In V3, functions like getRoutes, getTokens are imported directly from '@lifi/sdk'
 */
export const lifiConfig = createConfig({
    integrator: 'kite-app',
    apiUrl: 'https://li.quest/v1',
    rpcUrls: RPC_URLS,
    chains: SUPPORTED_CHAINS as any, // Type cast for SDK compatibility
});

/**
 * Default route options to use when fetching routes
 * These are passed as options to getRoutes() and getContractCallsQuote()
 */
export const DEFAULT_ROUTE_OPTIONS = {
    slippage: 0.005, // 0.5% slippage tolerance
    maxPriceImpact: 0.4, // Maximum 40% price impact (safety limit)
    allowSwitchChain: true, // Allow chain switching during execution
};

/**
 * Get list of supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChains(): ChainId[] {
    return SUPPORTED_CHAINS;
}

/**
 * Get supported tokens for a specific chain
 * Uses direct import from @lifi/sdk (V3 pattern)
 * 
 * @param chainId - The chain ID to fetch tokens for
 * @returns Promise resolving to array of supported tokens
 */
export async function getSupportedTokens(chainId: ChainId): Promise<Token[]> {
    try {
        const result = await getTokens({ chains: [chainId] });
        return result.tokens[chainId] || [];
    } catch (error) {
        console.error(`Failed to fetch tokens for chain ${chainId}:`, error);
        return [];
    }
}

/**
 * Get token details by address and chain
 * @param chainId - Chain ID
 * @param tokenAddress - Token contract address
 * @returns Promise resolving to token details or null if not found
 */
export async function getTokenByAddress(
    chainId: ChainId,
    tokenAddress: string
): Promise<Token | null> {
    try {
        const tokens = await getSupportedTokens(chainId);
        return (
            tokens.find(
                (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
            ) || null
        );
    } catch (error) {
        console.error('Failed to fetch token details:', error);
        return null;
    }
}

/**
 * Get RPC URL for a specific chain
 * @param chainId - Chain ID
 * @returns RPC URL string
 */
export function getRpcUrl(chainId: number): string {
    return RPC_URLS[chainId] || '';
}

/**
 * Check if a chain is supported
 * @param chainId - Chain ID to check
 * @returns True if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAINS.includes(chainId as ChainId);
}
