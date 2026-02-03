import { useState, useEffect, useCallback, useRef } from 'react';
import { getRoutes, getContractCallsQuote, type Route } from '@lifi/sdk';
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
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const fetchRoutes = useCallback(async () => {
        setError(null);
        setRoutes([]);
        setSelectedRoute(null);

        try {
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

            setIsLoading(true);
            let fetchedRoutes: Route[] = [];

            // ✅ CRITICAL FIX: Only use contract calls if BOTH vaultAddress AND depositCallData are valid
            if (vaultAddress &&
                vaultAddress !== '0x0000000000000000000000000000000000000000' &&
                depositCallData &&
                depositCallData !== '0x') {

                console.log('🔄 Using contract call route (KiteSafe):', {
                    vaultAddress,
                    depositCallData: depositCallData.slice(0, 10) + '...'
                });

                try {
                    // Use getContractCallsQuote for vault deposits via KiteSafe
                    const quote = await getContractCallsQuote({
                        fromAddress: fromAddress,      // Sender's wallet
                        fromChain: fromToken.chainId,   // Source chain
                        fromToken: fromToken.address,   // Source token
                        fromAmount: fromAmount,         // Amount to bridge
                        toChain: toToken.chainId,       // Destination chain
                        toToken: toToken.address,       // Destination token
                        contractCalls: [
                            {
                                // ✅ The KiteSafe contract address
                                toContractAddress: vaultAddress,

                                // ✅ The encoded safeDepositFor() calldata
                                toContractCallData: depositCallData,

                                // Amount for this contract call
                                fromAmount: fromAmount,

                                // Token address for the contract call
                                fromTokenAddress: toToken.address,

                                // Gas limit for the contract call
                                toContractGasLimit: '500000',
                            },
                        ],
                        slippage: slippage || DEFAULT_ROUTE_OPTIONS.slippage,
                    });

                    console.log('✅ Contract call quote received:', quote);

                    // ✅ CRITICAL FIX: getContractCallsQuote returns a Step, not a Route
                    // We need to wrap it in a Route-like structure or use includedSteps
                    if (quote && typeof quote === 'object') {
                        const quoteAny = quote as any;

                        // Check if includedSteps exists (this is the actual route steps)
                        if (quoteAny.includedSteps && Array.isArray(quoteAny.includedSteps)) {
                            // Create a Route-like object with the steps from includedSteps
                            const normalizedRoute = {
                                ...quoteAny,
                                steps: quoteAny.includedSteps,
                                // Ensure we have the required Route properties
                                fromChainId: fromToken.chainId,
                                toChainId: toToken.chainId,
                                fromTokenAddress: fromToken.address,
                                toTokenAddress: toToken.address,
                                fromAmount: fromAmount,
                                toAmount: quoteAny.estimate?.toAmount || '0',
                                fromAmountUSD: quoteAny.estimate?.fromAmountUSD,
                                toAmountUSD: quoteAny.estimate?.toAmountUSD,
                            };

                            fetchedRoutes = [normalizedRoute as unknown as Route];
                        } else {
                            console.warn('⚠️ Quote missing includedSteps, wrapping as single step');
                            // Wrap the quote as a single-step route
                            const wrappedRoute = {
                                id: quoteAny.id || Date.now().toString(),
                                fromChainId: fromToken.chainId,
                                toChainId: toToken.chainId,
                                fromTokenAddress: fromToken.address,
                                toTokenAddress: toToken.address,
                                fromAmount: fromAmount,
                                toAmount: quoteAny.estimate?.toAmount || '0',
                                fromAmountUSD: quoteAny.estimate?.fromAmountUSD,
                                toAmountUSD: quoteAny.estimate?.toAmountUSD,
                                steps: [quoteAny], // Wrap the quote as a single step
                                tags: quoteAny.tags || [],
                            };

                            fetchedRoutes = [wrappedRoute as unknown as Route];
                        }
                    } else {
                        throw new Error('Invalid quote response from LI.FI');
                    }
                } catch (contractCallError) {
                    console.error('❌ Contract call quote failed:', contractCallError);

                    // ✅ Fallback to regular transfer if contract call fails
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

                // ✅ Regular transfer without contract call
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

            // ✅ Validate routes have steps before formatting
            const validRoutes = fetchedRoutes.filter(route => {
                if (!route.steps || route.steps.length === 0) {
                    console.warn('⚠️ Route missing steps, skipping:', route);
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
        }
    }, [fromToken, toToken, fromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage]);

    const debouncedFetch = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchRoutes();
        }, 500);
    }, [fetchRoutes]);

    useEffect(() => {
        if (!enabled) return;

        if (fromToken && toToken && fromAmount && fromAmount !== '0' && fromAddress && toAddress) {
            debouncedFetch();
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [enabled, fromToken, toToken, fromAmount, fromAddress, toAddress, vaultAddress, depositCallData, slippage, debouncedFetch]);

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