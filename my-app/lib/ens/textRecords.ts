/**
 * ENS Text Record Constants and Helper Functions
 * For storing Kite preferences in ENS profiles
 */

// Kite-specific ENS text record keys
export const KITE_TEXT_RECORDS = {
    PREFERRED_CHAIN: 'kite.preferred_chain',
    PREFERRED_TOKEN: 'kite.preferred_token',
    DEPOSIT_TARGET: 'kite.deposit_target',
} as const;

// Standard ENS text record keys
export const ENS_TEXT_RECORDS = {
    AVATAR: 'avatar',
    DESCRIPTION: 'description',
    DISPLAY: 'display',
    EMAIL: 'email',
    URL: 'url',
    TWITTER: 'com.twitter',
    GITHUB: 'com.github',
} as const;

/**
 * Kite ENS Profile structure
 */
export interface KiteENSProfile {
    name: string;
    address: string;
    preferredChain?: string;
    preferredToken?: string;
    depositTarget?: string;
    avatar?: string;
}

/**
 * Chain ID to name mapping
 */
const CHAIN_ID_MAP: Record<number, string> = {
    1: 'ethereum',
    8453: 'base',
    42161: 'arbitrum',
    137: 'polygon',
};

/**
 * Chain name to ID mapping (reverse)
 */
const CHAIN_NAME_MAP: Record<string, number> = {
    ethereum: 1,
    base: 8453,
    arbitrum: 42161,
    polygon: 137,
};

/**
 * Validates if a name is a valid ENS name
 * @param name - The name to validate
 * @returns true if valid ENS name format
 */
export function isValidENSName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    const trimmed = name.trim().toLowerCase();

    // Must end with .eth
    if (!trimmed.endsWith('.eth')) return false;

    // Must have at least one character before .eth
    if (trimmed === '.eth') return false;

    // Check for valid characters (alphanumeric, hyphens, and dots)
    const validPattern = /^[a-z0-9.-]+\.eth$/;
    if (!validPattern.test(trimmed)) return false;

    // Should not start or end with hyphen or dot
    const parts = trimmed.split('.');
    for (const part of parts) {
        if (part.startsWith('-') || part.endsWith('-')) return false;
        if (part === '') return false;
    }

    return true;
}

/**
 * Get chain name from chain ID
 * @param chainId - The chain ID
 * @returns Chain name or 'unknown'
 */
export function getChainNameFromId(chainId: number): string {
    return CHAIN_ID_MAP[chainId] || 'unknown';
}

/**
 * Get chain ID from chain name
 * @param chainName - The chain name (case-insensitive)
 * @returns Chain ID or 0 if not found
 */
export function getChainIdFromName(chainName: string): number {
    if (!chainName || typeof chainName !== 'string') return 0;

    const normalized = chainName.toLowerCase().trim();
    return CHAIN_NAME_MAP[normalized] || 0;
}

/**
 * Get all supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
    return Object.keys(CHAIN_ID_MAP).map(Number);
}

/**
 * Get all supported chain names
 * @returns Array of supported chain names
 */
export function getSupportedChainNames(): string[] {
    return Object.values(CHAIN_ID_MAP);
}

/**
 * Check if a chain ID is supported
 * @param chainId - The chain ID to check
 * @returns true if supported
 */
export function isSupportedChain(chainId: number): boolean {
    return chainId in CHAIN_ID_MAP;
}
