import { useMemo } from 'react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { UserBalance } from '@/types/user';
import { formatTokenAmount } from '@/lib/utils/formatters';
import { getChainNameFromId } from '@/lib/ens/textRecords';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// Token addresses by chain
const USDC_ADDRESSES: Record<number, Address> = {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
    42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
    137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon
};

interface UseTokenBalanceOptions {
    address?: Address;
    chainIds?: number[];
}

interface UseTokenBalanceResult {
    balances: UserBalance[];
    isLoading: boolean;
    error: Error | null;
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
    const chainIds = options.chainIds || [1, 8453, 42161, 137]; // Ethereum, Base, Arbitrum, Polygon

    // Fetch native token balances for each chain
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

    // Build contracts array for USDC balances using multicall
    const usdcContracts = useMemo(() => {
        if (!targetAddress) return [];

        return chainIds
            .filter((chainId) => USDC_ADDRESSES[chainId])
            .map((chainId) => ({
                address: USDC_ADDRESSES[chainId],
                abi: ERC20_ABI,
                functionName: 'balanceOf' as const,
                args: [targetAddress],
                chainId,
            }));
    }, [targetAddress, chainIds]);

    // Fetch USDC balances
    const { data: usdcBalances, isLoading: isLoadingUsdc } = useReadContracts({
        contracts: usdcContracts,
        query: { enabled: !!targetAddress && usdcContracts.length > 0 },
    });

    // Aggregate loading states
    const isLoading = useMemo(() => {
        const nativeLoading = [
            ethereumBalance.isLoading,
            baseBalance.isLoading,
            arbitrumBalance.isLoading,
            polygonBalance.isLoading,
        ];
        return nativeLoading.some(Boolean) || isLoadingUsdc;
    }, [
        ethereumBalance.isLoading,
        baseBalance.isLoading,
        arbitrumBalance.isLoading,
        polygonBalance.isLoading,
        isLoadingUsdc,
    ]);

    // Build balances array
    const balances = useMemo((): UserBalance[] => {
        if (!targetAddress) return [];

        const result: UserBalance[] = [];

        // Helper to add balance
        const addBalance = (
            chainId: number,
            symbol: string,
            address: string,
            balance: bigint | undefined,
            decimals: number
        ) => {
            if (balance === undefined) return;

            result.push({
                chainId,
                chainName: getChainNameFromId(chainId),
                token: {
                    symbol,
                    address,
                    decimals,
                },
                balance: balance.toString(),
            });
        };

        // Add native token balances
        if (chainIds.includes(1) && ethereumBalance.data) {
            addBalance(
                1,
                'ETH',
                '0x0000000000000000000000000000000000000000',
                ethereumBalance.data.value,
                18
            );
        }

        if (chainIds.includes(8453) && baseBalance.data) {
            addBalance(
                8453,
                'ETH',
                '0x0000000000000000000000000000000000000000',
                baseBalance.data.value,
                18
            );
        }

        if (chainIds.includes(42161) && arbitrumBalance.data) {
            addBalance(
                42161,
                'ETH',
                '0x0000000000000000000000000000000000000000',
                arbitrumBalance.data.value,
                18
            );
        }

        if (chainIds.includes(137) && polygonBalance.data) {
            addBalance(
                137,
                'MATIC',
                '0x0000000000000000000000000000000000000000',
                polygonBalance.data.value,
                18
            );
        }

        // Add USDC balances
        if (usdcBalances) {
            usdcBalances.forEach((balanceResult, index) => {
                if (balanceResult.status === 'success' && balanceResult.result) {
                    const chainId = chainIds[index];
                    addBalance(
                        chainId,
                        'USDC',
                        USDC_ADDRESSES[chainId],
                        balanceResult.result as bigint,
                        6 // USDC has 6 decimals
                    );
                }
            });
        }

        return result;
    }, [
        targetAddress,
        chainIds,
        ethereumBalance.data,
        baseBalance.data,
        arbitrumBalance.data,
        polygonBalance.data,
        usdcBalances,
    ]);

    // Handle errors
    const error = useMemo(() => {
        const errors = [
            ethereumBalance.error,
            baseBalance.error,
            arbitrumBalance.error,
            polygonBalance.error,
        ].filter(Boolean);

        if (errors.length > 0) {
            return new Error(`Failed to fetch balances: ${errors[0]?.message}`);
        }

        return null;
    }, [
        ethereumBalance.error,
        baseBalance.error,
        arbitrumBalance.error,
        polygonBalance.error,
    ]);

    return {
        balances,
        isLoading,
        error,
    };
}
