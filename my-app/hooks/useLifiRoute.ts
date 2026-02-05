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
        depositCallData,
        slippage,
        enabled = true,
    } = options;

    // ✅ CRITICAL: Ensure fromAmount is a clean string with no formatting
    const normalizedFromAmount = useMemo(() => {
        if (!fromAmount) return '0';
        // Remove any commas, spaces, or formatting
        const cleaned = fromAmount.toString().replace(/[,\s]/g, '');
        // Ensure it's a valid number string
        return /^\d+$/.test(cleaned) ? cleaned : '0';
    }, [fromAmount]);

    const requestKey = useMemo(() => {
        return JSON.stringify({
            fromChain: fromToken?.chainId,
            toChain: toToken?.chainId,
            fromToken: fromToken?.address,
            toToken: toToken?.address,
            amount: normalizedFromAmount, // Use normalized amount
            fromAddress,
            toAddress,
            vault: vaultAddress,
            calldata: depositCallData,
            slippage,
        });
    }, [fromToken, toToken, normalizedFromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

    const isValidRequest = useMemo(() => {
        try {
            if (!fromToken || !toToken || !normalizedFromAmount || normalizedFromAmount === '0' || !fromAddress || !toAddress) {
                return false;
            }
            validateRouteRequest({
                fromToken,
                toToken,
                fromAmount: normalizedFromAmount, // Use normalized amount
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
    }, [fromToken, toToken, normalizedFromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

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

            const shouldUseKiteSafe = Boolean(
                vaultAddress &&
                vaultAddress !== '0x0000000000000000000000000000000000000000' &&
                depositCallData &&
                depositCallData !== '0x'
            );

            console.log('🔍 Fetching route with fromAmount:', normalizedFromAmount);

            if (shouldUseKiteSafe) {
                console.log('🔄 Using contract call route (KiteSafe)');

                if (!vaultAddress || !depositCallData) {
                    throw new Error('KiteSafe parameters unexpectedly undefined');
                }

                try {
                    console.log('📋 Getting executable contract call quote...');

                    const quote = await getQuote({
                        fromChain: fromToken.chainId,
                        toChain: toToken.chainId,
                        fromToken: fromToken.address,
                        toToken: toToken.address,
                        fromAmount: normalizedFromAmount, // ✅ Use normalized amount
                        fromAddress: fromAddress,
                        toAddress: toAddress,
                        contractCalls: [
                            {
                                toContractAddress: vaultAddress as string,
                                toContractCallData: depositCallData as string,
                                fromAmount: normalizedFromAmount, // ✅ Use normalized amount here too
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

                    if (quote && typeof quote === 'object' && quote.steps) {
                        // ✅ Store the original quote with exact fromAmount
                        fetchedRoutes = [quote as Route];
                        console.log('✅ Quote fromAmount stored:', (quote as any).fromAmount);
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
                        fromAmount: normalizedFromAmount, // ✅ Use normalized amount
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
                    fromAmount: normalizedFromAmount, // ✅ Use normalized amount
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

            if (sortedRoutes.length > 0) {
                const firstRoute = sortedRoutes[0];
                console.log('🔍 Selected route fromAmount:', (firstRoute as any).fromAmount);
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
    }, [requestKey, isValidRequest, fromToken, toToken, normalizedFromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

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