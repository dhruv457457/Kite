import { useMemo, useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import type { Address } from 'viem';
import { UserBalance } from '@/types/user';
import { getChainNameFromId } from '@/lib/ens/textRecords';

interface UseTokenBalanceOptions {
    address?: Address;
    chainIds?: number[];
}

interface UseTokenBalanceResult {
    balances: UserBalance[];
    isLoading: boolean;
    error: Error | null;
}

// Helper function to check if value is defined
function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Hook to fetch token balances across multiple chains
 * @param options - Configuration options
 * @returns Token balances, loading state, and error
 */
export default function useTokenBalance(
    options: UseTokenBalanceOptions = {}
): UseTokenBalanceResult {
    const { address: connectedAddress } = useAccount();

    const targetAddress = options.address || connectedAddress;
    const chainIds = options.chainIds || [1, 8453, 42161, 137];

    const [balances, setBalances] = useState<UserBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Start as true
    const [error, setError] = useState<Error | null>(null);

    // Fetch native token balances
    const ethereumBalance = useBalance({
        address: targetAddress,
        chainId: 1,
        query: { enabled: !!targetAddress && chainIds.includes(1) },
    });

    const baseBalance = useBalance({
        address: targetAddress,
        chainId: 8453,
        query: { enabled: !!targetAddress && chainIds.includes(8453) },
    });

    const arbitrumBalance = useBalance({
        address: targetAddress,
        chainId: 42161,
        query: { enabled: !!targetAddress && chainIds.includes(42161) },
    });

    const polygonBalance = useBalance({
        address: targetAddress,
        chainId: 137,
        query: { enabled: !!targetAddress && chainIds.includes(137) },
    });

    useEffect(() => {
        console.log('🔄 useTokenBalance: Effect triggered', {
            targetAddress,
            hasEthBalance: !!ethereumBalance.data,
            hasBaseBalance: !!baseBalance.data,
            hasArbBalance: !!arbitrumBalance.data,
            hasPolyBalance: !!polygonBalance.data,
        });

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
                    console.log('✅ Adding ETH balance:', ethereumBalance.data.value.toString());
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
                    console.log('✅ Adding Base ETH balance:', baseBalance.data.value.toString());
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
                    console.log('✅ Adding Arbitrum ETH balance:', arbitrumBalance.data.value.toString());
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
                    console.log('✅ Adding Polygon MATIC balance:', polygonBalance.data.value.toString());
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

                console.log(`📊 Native balances: ${allBalances.length} tokens`);

                // Fetch ERC20 tokens for each chain via API route
                console.log('🔍 Fetching ERC20 tokens from API...');
                const tokenPromises = chainIds.map(async (chainId) => {
                    try {
                        console.log(`🌐 Fetching tokens for chain ${chainId}...`);
                        const response = await fetch('/api/tokens/balances', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                address: targetAddress,
                                chainId
                            }),
                        });

                        if (!response.ok) {
                            console.error(`❌ HTTP error for chain ${chainId}! status: ${response.status}`);
                            const errorText = await response.text();
                            console.error(`❌ Error response:`, errorText);
                            return [];
                        }

                        const data = await response.json();
                        console.log(`✅ Chain ${chainId} response:`, data);

                        if (!data.tokens || !Array.isArray(data.tokens)) {
                            console.warn(`⚠️ Chain ${chainId}: Invalid tokens data`, data);
                            return [];
                        }

                        console.log(`✅ Chain ${chainId}: Found ${data.tokens.length} ERC20 tokens`);

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
                const allTokenBalances = tokenResults
                    .flat()
                    .filter(isDefined);

                console.log(`✅ Total ERC20 tokens: ${allTokenBalances.length}`);

                const finalBalances = [...allBalances, ...allTokenBalances];
                console.log(`🎉 Final total balances: ${finalBalances.length}`, finalBalances);

                setBalances(finalBalances);
            } catch (err) {
                const errorObj = err instanceof Error ? err : new Error('Failed to fetch token balances');
                console.error('❌ Error in useTokenBalance:', errorObj);
                setError(errorObj);
            } finally {
                setIsLoading(false);
                console.log('✅ useTokenBalance: Fetch complete');
            }
        };

        fetchAllTokenBalances();
    }, [
        targetAddress,
        // Don't include chainIds in deps to avoid unnecessary refetches
        ethereumBalance.data,
        baseBalance.data,
        arbitrumBalance.data,
        polygonBalance.data,
    ]);

    const finalIsLoading = isLoading ||
        ethereumBalance.isLoading ||
        baseBalance.isLoading ||
        arbitrumBalance.isLoading ||
        polygonBalance.isLoading;

    const finalError = error ||
        ethereumBalance.error ||
        baseBalance.error ||
        arbitrumBalance.error ||
        polygonBalance.error;

    console.log('🔍 useTokenBalance state:', {
        balancesCount: balances.length,
        isLoading: finalIsLoading,
        hasError: !!finalError,
    });

    return {
        balances,
        isLoading: finalIsLoading,
        error: finalError,
    };
}