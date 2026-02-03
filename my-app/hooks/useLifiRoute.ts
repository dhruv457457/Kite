import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getRoutes, getQuote, type Route } from '@lifi/sdk';
import { DEFAULT_ROUTE_OPTIONS } from '@/lib/lifi/config';
import type { KiteRouteRequest, KiteRoute } from '@/lib/lifi/types';
import {
    formatRouteForDisplay,
    validateRouteRequest,
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

export default function useLifiRoute(
    options: UseLifiRouteOptions
): UseLifiRouteResult {
    const [routes, setRoutes] = useState<KiteRoute[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<KiteRoute | null>(null);

    // ✅ Use ref to track if we're currently fetching to prevent duplicate calls
    const isFetchingRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ✅ Track previous request to avoid unnecessary refetches
    const prevRequestRef = useRef<string>('');

    const {
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        toAddress,
        vaultAddress,
        depositCallData,
        slippage,
        enabled = true,
    } = options;

    // ✅ Memoize the request key to detect actual changes
    const requestKey = useMemo(() => {
        return JSON.stringify({
            fromChain: fromToken?.chainId,
            toChain: toToken?.chainId,
            fromToken: fromToken?.address,
            toToken: toToken?.address,
            amount: fromAmount,
            fromAddress,
            toAddress,
            vault: vaultAddress,
            calldata: depositCallData,
            slippage,
        });
    }, [fromToken, toToken, fromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

    // ✅ Memoize validation check
    const isValidRequest = useMemo(() => {
        try {
            if (!fromToken || !toToken || !fromAmount || fromAmount === '0' || !fromAddress || !toAddress) {
                return false;
            }
            validateRouteRequest({
                fromToken,
                toToken,
                fromAmount,
                fromAddress,
                toAddress,
                vaultAddress,
                depositCallData,
                slippage,
            });
            return true;
        } catch {
            return false;
        }
    }, [fromToken, toToken, fromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

    // ✅ Stable fetchRoutes function with proper dependency management
    const fetchRoutes = useCallback(async () => {
        // Prevent duplicate fetches
        if (isFetchingRef.current) {
            console.log('⏭️ Skipping fetch - already in progress');
            return;
        }

        // Check if request actually changed
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

            // ✅ Check if we have valid KiteSafe params
            const shouldUseKiteSafe = Boolean(
                vaultAddress &&
                vaultAddress !== '0x0000000000000000000000000000000000000000' &&
                depositCallData &&
                depositCallData !== '0x'
            );

            if (shouldUseKiteSafe) {
                console.log('🔄 Using contract call route (KiteSafe)');

                // ✅ Runtime check to satisfy TypeScript
                if (!vaultAddress || !depositCallData) {
                    throw new Error('KiteSafe parameters unexpectedly undefined');
                }

                try {
                    // ✅ CRITICAL FIX: Use getQuote with contractCalls instead of getContractCallsQuote
                    // getQuote returns a proper Route object that can be executed directly
                    // getContractCallsQuote returns a Quote object that causes "Cannot read properties of undefined" errors
                    console.log('📋 Getting executable contract call quote...');

                    const quote = await getQuote({
                        fromChain: fromToken.chainId,
                        toChain: toToken.chainId,
                        fromToken: fromToken.address,
                        toToken: toToken.address,
                        fromAmount: fromAmount,
                        fromAddress: fromAddress,
                        toAddress: toAddress,
                        // ✅ Pass contract calls in the quote request
                        contractCalls: [
                            {
                                toContractAddress: vaultAddress as string,
                                toContractCallData: depositCallData as string,
                                fromAmount: fromAmount,
                                fromTokenAddress: toToken.address,
                                toContractGasLimit: '500000',
                            },
                        ],
                        options: {
                            slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
                            allowSwitchChain: DEFAULT_ROUTE_OPTIONS.allowSwitchChain,
                        },
                    });

                    console.log('✅ Contract call quote received');
                    console.log('🔍 Quote structure:', {
                        id: quote.id,
                        stepsCount: quote.steps?.length,
                        toAmount: quote.toAmount,
                        gasCostUSD: quote.gasCostUSD,
                    });

                    // ✅ getQuote returns a proper Route object - no conversion needed!
                    if (quote && typeof quote === 'object' && quote.steps) {
                        fetchedRoutes = [quote as Route];
                    } else {
                        throw new Error('Invalid quote response from LI.FI');
                    }
                } catch (contractCallError) {
                    console.error('❌ Contract call quote failed:', contractCallError);
                    console.log('🔄 Falling back to regular transfer route');

                    const result = await getRoutes({
                        fromChainId: fromToken.chainId,
                        toChainId: toToken.chainId,
                        fromTokenAddress: fromToken.address,
                        toTokenAddress: toToken.address,
                        fromAmount: fromAmount,
                        fromAddress: fromAddress,
                        toAddress: toAddress,
                        options: {
                            slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
                            allowSwitchChain: DEFAULT_ROUTE_OPTIONS.allowSwitchChain,
                        },
                    });

                    fetchedRoutes = result.routes || [];
                }
            } else {
                console.log('🔄 Using regular transfer route (no KiteSafe)');

                const result = await getRoutes({
                    fromChainId: fromToken.chainId,
                    toChainId: toToken.chainId,
                    fromTokenAddress: fromToken.address,
                    toTokenAddress: toToken.address,
                    fromAmount: fromAmount,
                    fromAddress: fromAddress,
                    toAddress: toAddress,
                    options: {
                        slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
                        allowSwitchChain: DEFAULT_ROUTE_OPTIONS.allowSwitchChain,
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
                throw new Error('No valid routes found. Routes are missing required data.');
            }

            console.log('✅ Valid routes:', validRoutes.length);

            const formattedRoutes = validRoutes.map((route) =>
                formatRouteForDisplay(route)
            );
            const sortedRoutes = sortRoutesByBest(formattedRoutes);

            // ✅ Debug: Log the first route to see its structure
            if (sortedRoutes.length > 0) {
                const firstRoute = sortedRoutes[0];
                console.log('🔍 First route structure:', {
                    id: firstRoute.id,
                    stepsCount: firstRoute.steps?.length,
                    gasCostUSD: firstRoute.gasCostUSD,
                    toAmount: firstRoute.toAmount,
                    toToken: firstRoute.toToken,
                    steps: firstRoute.steps?.map(s => ({
                        type: s.type,
                        tool: s.toolDetails?.name,
                        estimate: {
                            toAmount: s.estimate?.toAmount,
                            gasCosts: s.estimate?.gasCosts?.map(gc => gc.amountUSD),
                        }
                    })),
                });
            }

            setRoutes(sortedRoutes);
            if (sortedRoutes.length > 0) {
                setSelectedRoute(sortedRoutes[0]);
                console.log('✅ Selected route with', sortedRoutes[0].steps.length, 'steps');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch routes');
            console.error('❌ Route fetch error:', error);
            setError(error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [requestKey, isValidRequest, fromToken, toToken, fromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

    // ✅ Debounced fetch with cleanup
    const debouncedFetch = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchRoutes();
        }, 500);
    }, [fetchRoutes]);

    // ✅ Effect with proper cleanup and dependencies
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
        prevRequestRef.current = ''; // Clear cache to force refetch
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