/**
 * KiteSafe Contract Addresses
 * 
 * Central registry of deployed KiteSafe contract addresses across chains.
 * KiteSafe is a security wrapper that validates vault deposits before execution.
 */

/**
 * Mapping of chain IDs to KiteSafe contract addresses
 */
export const KITE_SAFE_ADDRESSES: Record<number, `0x${string}`> = {
    // Base Mainnet
    8453: '0x97cFF7a2B8321c8B60c173FcB2a50459F879b759',

    // Arbitrum One
    42161: '0xbe5064fa89f7533def973EaF00BAc0BD87fcA40f',
};


export function getKiteSafeAddress(chainId: number): `0x${string}` | undefined {
    return KITE_SAFE_ADDRESSES[chainId];
}

/**
 * Check if KiteSafe is deployed on a specific chain
 * 
 * @param chainId - The chain ID to check
 * @returns True if KiteSafe is deployed on the chain
 * 
 * @example
 * if (isKiteSafeSupported(8453)) {
 *   // Use KiteSafe for this deposit
 * }
 */
export function isKiteSafeSupported(chainId: number): boolean {
    return chainId in KITE_SAFE_ADDRESSES;
}

/**
 * Get all chains where KiteSafe is deployed
 * 
 * @returns Array of chain IDs where KiteSafe is available
 */
export function getSupportedKiteSafeChains(): number[] {
    return Object.keys(KITE_SAFE_ADDRESSES).map(Number);
}
