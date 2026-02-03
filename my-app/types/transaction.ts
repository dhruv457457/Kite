/**
 * Transaction Type Definitions
 */

import { LifiRoute } from './lifi';

/**
 * Transaction participant (sender or receiver)
 */
export interface TransactionParty {
    /** Ethereum address */
    address: string;

    /** ENS name if available */
    ensName?: string;
}

/**
 * Transaction amounts
 */
export interface TransactionAmounts {
    /** Input amount in token units */
    input: string;

    /** Output amount in token units */
    output: string;

    /** Input amount in USD */
    inputUSD?: string;

    /** Output amount in USD */
    outputUSD?: string;
}

/**
 * Transaction hash collection
 */
export interface TransactionHashes {
    /** Swap transaction hash (if applicable) */
    swap?: string;

    /** Bridge transaction hash (if applicable) */
    bridge?: string;

    /** Deposit transaction hash (if applicable) */
    deposit?: string;
}

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Complete transaction record
 */
export interface Transaction {
    /** Unique transaction ID */
    id: string;

    /** Timestamp in seconds */
    timestamp: number;

    /** Sender information */
    from: TransactionParty;

    /** Receiver information */
    to: TransactionParty;

    /** LI.FI route used */
    route: LifiRoute;

    /** Current status */
    status: TransactionStatus;

    /** Transaction hashes for each step */
    txHashes: TransactionHashes;

    /** Amount information */
    amounts: TransactionAmounts;
}

/**
 * Transaction receipt from blockchain
 */
export interface TransactionReceipt {
    /** Transaction hash */
    txHash: string;

    /** Block number */
    blockNumber: number;

    /** Success or failure */
    status: 'success' | 'failure';

    /** Gas used */
    gasUsed: string;

    /** Effective gas price */
    effectiveGasPrice: string;
}

/**
 * Transaction history query options
 */
export interface TransactionHistoryOptions {
    /** Filter by user address */
    address?: string;

    /** Filter by status */
    status?: TransactionStatus;

    /** Limit number of results */
    limit?: number;

    /** Offset for pagination */
    offset?: number;

    /** Start date (timestamp in seconds) */
    startDate?: number;

    /** End date (timestamp in seconds) */
    endDate?: number;
}

/**
 * Transaction history result
 */
export interface TransactionHistory {
    /** Array of transactions */
    transactions: Transaction[];

    /** Total count (for pagination) */
    total: number;

    /** Whether there are more results */
    hasMore: boolean;
}
