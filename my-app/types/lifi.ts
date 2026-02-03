/**
 * LI.FI Integration Type Definitions
 */

/**
 * Token information
 */
export interface LifiToken {
    /** Token contract address */
    address: string;

    /** Token symbol (e.g., USDC, ETH) */
    symbol: string;

    /** Token decimals */
    decimals: number;

    /** Chain ID where token exists */
    chainId: number;

    /** Token name */
    name: string;

    /** Current price in USD */
    priceUSD?: string;

    /** Token logo URI */
    logoURI?: string;
}

/**
 * Single step in a cross-chain route
 */
export interface LifiStep {
    /** Step type */
    type: 'swap' | 'bridge' | 'contract';

    /** Tool/protocol used for this step */
    tool: string;

    /** Tool details */
    toolDetails: {
        name: string;
        logoURI?: string;
    };

    /** Action details */
    action: {
        fromToken: LifiToken;
        toToken: LifiToken;
        fromAmount: string;
        toAmount: string;
        slippage: number;
    };

    /** Estimate information */
    estimate: {
        gasCosts: Array<{
            type: string;
            amount: string;
            amountUSD?: string;
        }>;
        executionDuration: number; // in seconds
    };

    /** Transaction request data */
    transactionRequest?: {
        to: string;
        from: string;
        data: string;
        value: string;
        gasLimit: string;
        gasPrice?: string;
    };
}

/**
 * Complete route from source to destination
 */
export interface LifiRoute {
    /** Unique route ID */
    id: string;

    /** Source chain ID */
    fromChainId: number;

    /** Destination chain ID */
    toChainId: number;

    /** Source token */
    fromToken: LifiToken;

    /** Destination token */
    toToken: LifiToken;

    /** Input amount */
    fromAmount: string;

    /** Expected output amount */
    toAmount: string;

    /** Steps to execute */
    steps: LifiStep[];

    /** Route tags (e.g., RECOMMENDED, FASTEST, CHEAPEST) */
    tags?: string[];

    /** Total gas cost in USD */
    gasCostUSD?: string;

    /** Insurance information */
    insurance?: {
        state: string;
        feeAmountUsd: string;
    };
}

/**
 * Request for getting route quotes
 */
export interface LifiQuoteRequest {
    /** Source chain ID */
    fromChain: number;

    /** Destination chain ID */
    toChain: number;

    /** Source token address */
    fromToken: string;

    /** Destination token address */
    toToken: string;

    /** Sender address */
    fromAddress: string;

    /** Receiver address */
    toAddress: string;

    /** Amount to send (in wei/smallest unit) */
    fromAmount: string;

    /** Slippage tolerance (e.g., 0.5 for 0.5%) */
    slippage?: number;

    /** Allow switching chains */
    allowSwitchChain?: boolean;
}

/**
 * Route execution status
 */
export interface LifiRouteStatus {
    /** Overall status */
    status: 'PENDING' | 'DONE' | 'FAILED' | 'INVALID' | 'NOT_FOUND';

    /** Detailed substatus */
    substatus?: string;

    /** Substatus message */
    substatusMessage?: string;

    /** Sending transaction details */
    sending?: {
        txHash: string;
        amount: string;
        token: LifiToken;
        chainId: number;
    };

    /** Receiving transaction details */
    receiving?: {
        txHash: string;
        amount: string;
        token: LifiToken;
        chainId: number;
    };
}

/**
 * Route execution update
 */
export interface LifiExecutionUpdate {
    /** Execution status */
    status: 'ACTION_REQUIRED' | 'PENDING' | 'DONE' | 'FAILED';

    /** Process details */
    process: Array<{
        type: string;
        status: 'PENDING' | 'DONE' | 'FAILED';
        txHash?: string;
        txLink?: string;
    }>;
}

/**
 * LI.FI SDK Configuration
 */
export interface LifiConfig {
    /** Integrator name */
    integrator: string;

    /** API key (optional) */
    apiKey?: string;

    /** RPC providers per chain */
    rpcUrls?: Record<number, string[]>;
}

/**
 * Token balance information
 */
export interface LifiTokenBalance {
    /** Token details */
    token: LifiToken;

    /** Balance in smallest unit */
    amount: string;

    /** Balance in USD */
    amountUSD?: string;
}
