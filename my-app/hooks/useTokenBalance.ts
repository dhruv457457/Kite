import { useMemo, useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import type { Address } from 'viem';
import { UserBalance } from '@/types/user';
import { getChainNameFromId } from '@/lib/ens/textRecords';

interface UseTokenBalanceOptions {
    address?: Address;
    chainIds?: number[];
    enabled?: boolean; // ✅ NEW: Allow disabling
}

interface UseTokenBalanceResult {
    balances: UserBalance[];
    isLoading: boolean;
    error: Error | null;
}

function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export default function useTokenBalance(
    options: UseTokenBalanceOptions = {}
): UseTokenBalanceResult {
    const { address: connectedAddress } = useAccount();

    const targetAddress = options.address || connectedAddress;
    const chainIds = options.chainIds || [1, 8453, 42161, 137];
    const enabled = options.enabled !== false; // ✅ Default to true

    const [balances, setBalances] = useState<UserBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // ✅ Only fetch native balances if enabled
    const ethereumBalance = useBalance({
        address: targetAddress,
        chainId: 1,
        query: { enabled: enabled && !!targetAddress && chainIds.includes(1) },
    });

    const baseBalance = useBalance({
        address: targetAddress,
        chainId: 8453,
        query: { enabled: enabled && !!targetAddress && chainIds.includes(8453) },
    });

    const arbitrumBalance = useBalance({
        address: targetAddress,
        chainId: 42161,
        query: { enabled: enabled && !!targetAddress && chainIds.includes(42161) },
    });

    const polygonBalance = useBalance({
        address: targetAddress,
        chainId: 137,
        query: { enabled: enabled && !!targetAddress && chainIds.includes(137) },
    });

    useEffect(() => {
        // ✅ Skip if disabled
        if (!enabled) {
            console.log('⏸️ useTokenBalance: Disabled');
            setBalances([]);
            setIsLoading(false);
            return;
        }

        if (!targetAddress) {
            console.log('⚠️ useTokenBalance: No target address');
            setBalances([]);
            setIsLoading(false);
            return;
        }

        const fetchAllTokenBalances = async () => {
            console.log('🚀 useTokenBalance: Starting fetch for', targetAddress);
            setIsLoading(true);
            setError(null);

            try {
                const allBalances: UserBalance[] = [];

                // Add native token balances
                if (chainIds.includes(1) && ethereumBalance.data) {
                    allBalances.push({
                        chainId: 1,
                        chainName: getChainNameFromId(1),
                        token: {
                            symbol: 'ETH',
                            address: '0x0000000000000000000000000000000000000000',
                            decimals: 18,
                        },
                        balance: ethereumBalance.data.value.toString(),
                    });
                }

                if (chainIds.includes(8453) && baseBalance.data) {
                    allBalances.push({
                        chainId: 8453,
                        chainName: getChainNameFromId(8453),
                        token: {
                            symbol: 'ETH',
                            address: '0x0000000000000000000000000000000000000000',
                            decimals: 18,
                        },
                        balance: baseBalance.data.value.toString(),
                    });
                }

                if (chainIds.includes(42161) && arbitrumBalance.data) {
                    allBalances.push({
                        chainId: 42161,
                        chainName: getChainNameFromId(42161),
                        token: {
                            symbol: 'ETH',
                            address: '0x0000000000000000000000000000000000000000',
                            decimals: 18,
                        },
                        balance: arbitrumBalance.data.value.toString(),
                    });
                }

                if (chainIds.includes(137) && polygonBalance.data) {
                    allBalances.push({
                        chainId: 137,
                        chainName: getChainNameFromId(137),
                        token: {
                            symbol: 'MATIC',
                            address: '0x0000000000000000000000000000000000000000',
                            decimals: 18,
                        },
                        balance: polygonBalance.data.value.toString(),
                    });
                }

                // Fetch ERC20 tokens
                const tokenPromises = chainIds.map(async (chainId) => {
                    try {
                        const response = await fetch('/api/tokens/balances', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                address: targetAddress,
                                chainId
                            }),
                        });

                        if (!response.ok) {
                            console.error(`❌ HTTP error for chain ${chainId}:`, response.status);
                            return [];
                        }

                        const data = await response.json();

                        if (!data.tokens || !Array.isArray(data.tokens)) {
                            return [];
                        }

                        return data.tokens.map((token: any) => ({
                            chainId,
                            chainName: getChainNameFromId(chainId),
                            token: {
                                symbol: token.symbol || 'UNKNOWN',
                                address: token.contractAddress,
                                decimals: token.decimals || 18,
                            },
                            balance: BigInt(token.balance || '0').toString(),
                        }));
                    } catch (err) {
                        console.error(`❌ Error fetching tokens for chain ${chainId}:`, err);
                        return [];
                    }
                });

                const tokenResults = await Promise.all(tokenPromises);
                const allTokenBalances = tokenResults.flat().filter(isDefined);

                const finalBalances = [...allBalances, ...allTokenBalances];
                console.log(`🎉 Final total balances: ${finalBalances.length}`);

                setBalances(finalBalances);
            } catch (err) {
                const errorObj = err instanceof Error ? err : new Error('Failed to fetch token balances');
                console.error('❌ Error in useTokenBalance:', errorObj);
                setError(errorObj);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllTokenBalances();
    }, [
        enabled, // ✅ Add enabled to deps
        targetAddress,
        ethereumBalance.data,
        baseBalance.data,
        arbitrumBalance.data,
        polygonBalance.data,
    ]);

    const finalIsLoading = isLoading ||
        (enabled && (
            ethereumBalance.isLoading ||
            baseBalance.isLoading ||
            arbitrumBalance.isLoading ||
            polygonBalance.isLoading
        ));

    const finalError = error ||
        ethereumBalance.error ||
        baseBalance.error ||
        arbitrumBalance.error ||
        polygonBalance.error;

    return {
        balances,
        isLoading: finalIsLoading,
        error: finalError,
    };
}