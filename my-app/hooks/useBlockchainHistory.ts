'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';

export interface BlockchainTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    tokenSymbol?: string;
    tokenName?: string; // Alchemy usually provides symbol, name requires metadata fetch
    timestamp: number;
    chainId: number;
    status: 'success' | 'failed';
    // Gas fields are optional here as AssetTransfers is optimized for value movement, not gas tracking
    gasUsed?: string;
    gasPrice?: string;
    blockNum: string;
}

interface UseBlockchainHistoryResult {
    transactions: BlockchainTransaction[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Map your Chain IDs to Alchemy Networks and your Env Vars
const CHAIN_CONFIGS: Record<number, { network: Network; url: string }> = {
    1: {
        network: Network.ETH_MAINNET,
        url: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '', // Using your specific env var names
    },
    8453: {
        network: Network.BASE_MAINNET,
        url: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
    },
    42161: {
        network: Network.ARB_MAINNET,
        url: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '',
    },
    137: {
        network: Network.MATIC_MAINNET,
        url: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || '',
    },
};

/**
 * Helper to extract the raw API Key from the full Alchemy URL
 * e.g., https://.../v2/YOUR_KEY -> YOUR_KEY
 */
const getApiKeyFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
};

export function useBlockchainHistory(): UseBlockchainHistoryResult {
    const { address } = useAccount();
    const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchTransactions = async () => {
        if (!address) {
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const allTransactions: BlockchainTransaction[] = [];

            // Process all chains in parallel
            const promises = Object.entries(CHAIN_CONFIGS).map(async ([chainIdStr, config]) => {
                const chainId = parseInt(chainIdStr);
                const apiKey = getApiKeyFromUrl(config.url);

                if (!apiKey || apiKey.startsWith('http')) {
                    console.warn(`⚠️ Invalid or missing API key for chain ${chainId}`);
                    return;
                }

                const settings = {
                    apiKey: apiKey,
                    network: config.network,
                };

                const alchemy = new Alchemy(settings);

                try {
                    // Fetch Incoming and Outgoing transfers for ETH (External) and Tokens (ERC20)
                    const data = await alchemy.core.getAssetTransfers({
                        fromBlock: "0x0",
                        toBlock: "latest",
                        fromAddress: address, // Outgoing
                        excludeZeroValue: true,
                        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
                        order: SortingOrder.DESCENDING,
                        maxCount: 50, // Limit per chain for performance
                        withMetadata: true
                    });

                    const incomingData = await alchemy.core.getAssetTransfers({
                        fromBlock: "0x0",
                        toBlock: "latest",
                        toAddress: address, // Incoming
                        excludeZeroValue: true,
                        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
                        order: SortingOrder.DESCENDING,
                        maxCount: 50,
                        withMetadata: true
                    });

                    // Combine incoming and outgoing
                    const rawTxs = [...data.transfers, ...incomingData.transfers];

                    const chainTxs: BlockchainTransaction[] = rawTxs.map(tx => ({
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to || '',
                        // Alchemy returns value as a number, convert to string
                        value: tx.value?.toString() || '0',
                        tokenSymbol: tx.asset || 'ETH',
                        tokenName: tx.asset || 'Ether',
                        timestamp: tx.metadata.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() : Date.now(),
                        chainId: chainId,
                        status: 'success', // Alchemy history generally implies success
                        blockNum: tx.blockNum
                    }));

                    allTransactions.push(...chainTxs);

                } catch (err) {
                    console.error(`❌ Error fetching chain ${chainId}:`, err);
                }
            });

            await Promise.all(promises);

            // Sort combined results by timestamp (newest first)
            const sorted = allTransactions.sort((a, b) => b.timestamp - a.timestamp);

            // Remove duplicates (possible if a tx is both to/from the same address or API overlap)
            const unique = sorted.filter(
                (tx, index, self) => index === self.findIndex((t) => t.hash === tx.hash)
            );

            setTransactions(unique);

        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch transactions');
            console.error('❌ Error in useBlockchainHistory:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [address]);

    return {
        transactions,
        isLoading,
        error,
        refetch: fetchTransactions,
    };
}