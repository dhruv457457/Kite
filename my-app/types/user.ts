/**
 * User State Type Definitions
 */

/**
 * Token information for balance
 */
export interface UserBalanceToken {
    /** Token symbol (e.g., USDC, ETH) */
    symbol: string;

    /** Token contract address */
    address: string;

    /** Token decimals */
    decimals: number;
}

/**
 * User's token balance on a specific chain
 */
export interface UserBalance {
    /** Chain ID */
    chainId: number;

    /** Chain name */
    chainName: string;

    /** Token details */
    token: UserBalanceToken;

    /** Balance in token units (as string to avoid precision loss) */
    balance: string;

    /** Balance value in USD */
    balanceUSD?: string;
}

/**
 * User profile and connection state
 */
export interface UserProfile {
    /** User's Ethereum address */
    address: string;

    /** User's ENS name if available */
    ensName?: string;

    /** User's token balances across chains */
    balances: UserBalance[];

    /** Whether user is currently connected */
    isConnected: boolean;
}

/**
 * User preferences for sending/receiving
 */
export interface UserPreferences {
    /** Default slippage tolerance (percentage) */
    defaultSlippage: number;

    /** Default chain for receiving */
    preferredChain?: number;

    /** Default token for receiving */
    preferredToken?: string;

    /** Whether to show USD values */
    showUSD: boolean;

    /** Theme preference */
    theme: 'dark' | 'light' | 'auto';
}

/**
 * User session data
 */
export interface UserSession {
    /** User profile */
    profile: UserProfile;

    /** User preferences */
    preferences: UserPreferences;

    /** Session start timestamp */
    sessionStart: number;

    /** Last activity timestamp */
    lastActivity: number;
}
