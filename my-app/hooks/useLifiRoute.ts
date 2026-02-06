import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getRoutes, getQuote, type Route, type Step } from '@lifi/sdk';
import { DEFAULT_ROUTE_OPTIONS } from '@/lib/lifi/config';
import type { KiteRouteRequest, KiteRoute } from '@/lib/lifi/types';
import {
    formatRouteForDisplay,
    sortRoutesByBest,
} from '@/lib/lifi/types';

interface UseLifiRouteOptions extends KiteRouteRequest {
    enabled?: boolean;
}

interface UseLifiRouteResult {
    routes: KiteRoute[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    selectedRoute: KiteRoute | null;
    selectRoute: (routeId: string) => void;
}

// ✅ Working vault addresses
const VAULT_ADDRESSES: Record<number, `0x${string}`> = {
    8453: '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // Spark USDC Vault on Base
};

export default function useLifiRoute(
    options: UseLifiRouteOptions
): UseLifiRouteResult {
    const [routes, setRoutes] = useState<KiteRoute[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<KiteRoute | null>(null);

    const isFetchingRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const prevRequestRef = useRef<string>('');

    const {
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        toAddress,
        vaultAddress,
        slippage,
        enabled = true,
    } = options;

    const normalizedFromAmount = useMemo(() => {
        if (!fromAmount) return '0';
        const cleaned = fromAmount.toString().replace(/[,\s]/g, '');
        return /^\d+$/.test(cleaned) ? cleaned : '0';
    }, [fromAmount]);

    const requestKey = useMemo(() => {
        return JSON.stringify({
            fromChain: fromToken?.chainId,
            toChain: toToken?.chainId,
            fromToken: fromToken?.address,
            toToken: toToken?.address,
            amount: normalizedFromAmount,
            fromAddress,
            toAddress,
            vault: vaultAddress,
            slippage,
        });
    }, [fromToken, toToken, normalizedFromAmount, fromAddress, toAddress, vaultAddress, slippage]);

    const isValidRequest = useMemo(() => {
        return Boolean(
            fromToken &&
            toToken &&
            normalizedFromAmount &&
            normalizedFromAmount !== '0' &&
            fromAddress &&
            toAddress
        );
    }, [fromToken, toToken, normalizedFromAmount, fromAddress, toAddress]);

    const fetchRoutes = useCallback(async () => {
        if (isFetchingRef.current) {
            console.log('⏭️ Skipping fetch - already in progress');
            return;
        }

        if (requestKey === prevRequestRef.current) {
            console.log('⏭️ Skipping fetch - request unchanged');
            return;
        }

        setError(null);
        setRoutes([]);
        setSelectedRoute(null);
        isFetchingRef.current = true;

        try {
            if (!isValidRequest) {
                throw new Error('Invalid route request parameters');
            }

            setIsLoading(true);
            prevRequestRef.current = requestKey;

            let fetchedRoutes: Route[] = [];

            // ✅ Check if vault deposit is requested
            const shouldUseVaultDeposit = Boolean(
                vaultAddress &&
                vaultAddress !== '0x0000000000000000000000000000000000000000' &&
                VAULT_ADDRESSES[toToken.chainId] &&
                vaultAddress.toLowerCase() === VAULT_ADDRESSES[toToken.chainId].toLowerCase()
            );

            console.log('🔍 Route Configuration:', {
                from: fromToken.symbol,
                to: toToken.symbol,
                amount: normalizedFromAmount,
                fromChain: fromToken.chainId,
                toChain: toToken.chainId,
                hasVault: shouldUseVaultDeposit,
                vaultAddress,
            });

            // ✅ VAULT DEPOSIT - Use getQuote() with vault as toToken
          // ✅ VAULT DEPOSIT - Use getQuote() with vault as toToken
if (shouldUseVaultDeposit) {
    console.log('🎯 Using LI.FI Composer: vault address as destination');

    try {
        // ✅ NO explicit typing - let TypeScript infer
        const step = await getQuote({
            fromChain: fromToken.chainId,
            fromToken: fromToken.address,
            toChain: toToken.chainId,
            toToken: vaultAddress as string, // ✅ Vault address!
            fromAmount: normalizedFromAmount,
            fromAddress: fromAddress,
            toAddress: toAddress,
            slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
            integrator: 'kite-finance',
        });

        console.log('✅ Vault deposit quote received:', {
            id: step.id,
            type: step.type,
            tool: step.tool,
        });

        // ✅ Convert Step to Route format
        const route: Route = {
            id: step.id,
            fromChainId: step.action.fromChainId,
            fromAmountUSD: step.estimate?.fromAmountUSD || '0',
            fromAmount: step.action.fromAmount,
            fromToken: step.action.fromToken,
            fromAddress: step.action.fromAddress,
            toChainId: step.action.toChainId,
            toAmountUSD: step.estimate?.toAmountUSD || '0',
            toAmount: step.estimate?.toAmount || '0',
            toAmountMin: step.estimate?.toAmountMin || '0',
            toToken: step.action.toToken,
            toAddress: step.action.toAddress,
            gasCostUSD: step.estimate?.gasCosts?.reduce((sum: number, cost) => {
                return sum + parseFloat(cost.amountUSD || '0');
            }, 0).toString() || '0',
            steps: [step] as any, // ✅ Type assertion here instead
            insurance: (step as any).insurance,
            tags: (step as any).tags || [],
        };

        fetchedRoutes = [route];
        console.log('✅ Vault deposit route created with LI.FI Composer');
    } catch (vaultError) {
        console.error('❌ Vault deposit failed:', vaultError);
        console.log('🔄 Falling back to regular transfer');
    }
}

            // ✅ REGULAR ROUTE (no vault OR vault failed)
            if (fetchedRoutes.length === 0) {
                console.log('💸 Using regular transfer route');

                const result = await getRoutes({
                    fromChainId: fromToken.chainId,
                    toChainId: toToken.chainId,
                    fromTokenAddress: fromToken.address,
                    toTokenAddress: toToken.address,
                    fromAmount: normalizedFromAmount,
                    fromAddress: fromAddress,
                    toAddress: toAddress,
                    options: {
                        slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
                        allowSwitchChain: DEFAULT_ROUTE_OPTIONS.allowSwitchChain,
                        integrator: 'kite-finance',
                    },
                });

                fetchedRoutes = result.routes || [];
            }

            if (fetchedRoutes.length === 0) {
                throw new Error('No routes available. Try a different token or amount.');
            }

            console.log('📊 Routes fetched:', fetchedRoutes.length);

            const validRoutes = fetchedRoutes.filter(route => {
                if (!route.steps || route.steps.length === 0) {
                    console.warn('⚠️ Route missing steps, skipping');
                    return false;
                }
                return true;
            });

            if (validRoutes.length === 0) {
                throw new Error('No valid routes found.');
            }

            console.log('✅ Valid routes:', validRoutes.length);

            const formattedRoutes = validRoutes.map((route) => formatRouteForDisplay(route));
            const sortedRoutes = sortRoutesByBest(formattedRoutes);

            setRoutes(sortedRoutes);

            if (sortedRoutes.length > 0) {
                const bestRoute = sortedRoutes[0];
                setSelectedRoute(bestRoute);

                console.log('✅ Selected best route:', {
                    id: bestRoute.id,
                    steps: bestRoute.steps.length,
                    gasCostUSD: bestRoute.gasCostUSD,
                    hasVault: shouldUseVaultDeposit,
                });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch routes');
            console.error('❌ Route fetch error:', error);
            setError(error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [requestKey, isValidRequest, fromToken, toToken, normalizedFromAmount, fromAddress, toAddress, vaultAddress, slippage]);

    const debouncedFetch = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchRoutes();
        }, 500);
    }, [fetchRoutes]);

    useEffect(() => {
        if (!enabled || !isValidRequest) {
            return;
        }

        debouncedFetch();

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [enabled, isValidRequest, requestKey, debouncedFetch]);

    const selectRoute = useCallback(
        (routeId: string) => {
            const route = routes.find((r) => r.id === routeId);
            if (route) {
                setSelectedRoute(route);
            }
        },
        [routes]
    );

    const refetch = useCallback(() => {
        prevRequestRef.current = '';
        fetchRoutes();
    }, [fetchRoutes]);

    return {
        routes,
        isLoading,
        error,
        refetch,
        selectedRoute,
        selectRoute,
    };
}