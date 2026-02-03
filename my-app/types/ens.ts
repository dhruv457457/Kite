/**
 * ENS Type Definitions
 */

/**
 * ENS Profile with Kite-specific preferences
 */
export interface ENSProfile {
    /** ENS name (e.g., vitalik.eth) */
    name: string;

    /** Ethereum address */
    address: `0x${string}`;

    /** Preferred chain for receiving deposits */
    preferredChain?: string;

    /** Preferred token symbol (e.g., USDC, ETH) */
    preferredToken?: string;

    /** Target address/vault for deposits */
    depositTarget?: `0x${string}`;

    /** Avatar URL or IPFS hash */
    avatar?: string;

    /** Display name (from ENS text record) */
    displayName?: string;
}

/**
 * ENS Text Record key-value pair
 */
export interface ENSTextRecord {
    /** Text record key (e.g., 'avatar', 'kite.preferred_chain') */
    key: string;

    /** Text record value */
    value: string;
}

/**
 * Result from ENS resolver lookup
 */
export interface ENSResolverResult {
    /** Resolved Ethereum address */
    address: `0x${string}` | null;

    /** ENS name */
    name: string | null;

    /** Avatar URL */
    avatar: string | null;

    /** All text records as key-value pairs */
    records: Record<string, string>;
}

/**
 * ENS lookup error types
 */
export type ENSError =
    | 'NOT_FOUND'
    | 'INVALID_NAME'
    | 'RESOLVER_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR';

/**
 * ENS lookup result with error handling
 */
export interface ENSLookupResult {
    /** Whether the lookup was successful */
    success: boolean;

    /** ENS profile if successful */
    profile?: ENSProfile;

    /** Error type if failed */
    error?: ENSError;

    /** Error message if failed */
    errorMessage?: string;
}
