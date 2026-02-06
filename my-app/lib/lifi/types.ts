import type { Route, LiFiStep } from '@lifi/sdk';

/**
 * Kite-specific route request with vault deposit details
 * 
 * ✅ UPDATED: Added vaultAddress to separate recipient's wallet from vault contract
 */
export interface KiteRouteRequest {
    fromToken: {
        address: string;
        chainId: number;
        symbol: string;
        decimals: number;
    };
    toToken: {
        address: string;
        chainId: number;
        symbol: string;
        decimals: number;
    };
    fromAmount: string; // Amount in wei/smallest unit
    fromAddress: string; // User's wallet address (sender)
    toAddress: string; // ✅ UPDATED: Recipient's wallet address (where bridged tokens land)
    vaultAddress?: string; // ✅ NEW: Vault/pool/restaking contract address (for deposits via contract call)
    depositCallData?: string; // Encoded deposit function call (for Composer mode)
    slippage?: number; // Custom slippage (optional, defaults to 0.005)
}

/**
 * Extended route with Kite-specific display data
 * Now extends SDK's Route type directly
 */
export interface KiteRoute extends Route {
    totalGasCostUSD: string;
    totalTimeEstimate: number; // Estimated total time in seconds
    dexName?: string; // Primary DEX used (e.g., "Uniswap V3")
    bridgeName?: string; // Bridge used (e.g., "Stargate")
    vaultName?: string; // Vault name (extracted from ENS or contract)
}

/**
 * Execution progress tracking
 * ✅ UPDATED: Added 'chain-switch' step type
 */
export interface ExecutionProgress {
    currentStep: number;
    totalSteps: number;
    steps: Array<{
        type: 'swap' | 'bridge' | 'deposit' | 'chain-switch'; // ✅ Added chain-switch
        status: 'pending' | 'executing' | 'completed' | 'failed';
        txHash?: string;
        error?: string;
        name?: string; // Step name for display
    }>;
    status?: 'pending' | 'executing' | 'completed' | 'failed'; // ✅ Added for overall status
}

/**
 * Callbacks for route execution
 */
export interface ExecutionCallbacks {
    onStepUpdate?: (step: number, status: string) => void;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
}

/**
 * Type guard: Check if step is a swap
 */
export function isSwapStep(step: LiFiStep): boolean {
    return (step as any).type === 'swap' || (step as any).action?.fromChainId === (step as any).action?.toChainId;
}

/**
 * Type guard: Check if step is a bridge/cross-chain transfer
 */
export function isBridgeStep(step: LiFiStep): boolean {
    return (step as any).type === 'cross' || (step as any).action?.fromChainId !== (step as any).action?.toChainId;
}

/**
 * Type guard: Check if step includes a contract call
 */
export function isContractCallStep(step: LiFiStep): boolean {
    return (step as any).type === 'custom' || (step as any).type === 'contract' || !!(step as any).includedSteps;
}

/**
 * Extract and sum all gas costs from a route
 * @param route - The LI.FI route
 * @returns Total gas cost in USD as string
 */
export function extractGasCosts(route: Route): string {
    try {
        if (!route?.steps) return '0.00';

        let totalGasCostUSD = 0;

        route.steps.forEach((step) => {
            if (step.estimate?.gasCosts) {
                step.estimate.gasCosts.forEach((gasCost) => {
                    if (gasCost.amountUSD) {
                        totalGasCostUSD += parseFloat(gasCost.amountUSD);
                    }
                });
            }
        });

        return totalGasCostUSD.toFixed(2);
    } catch (error) {
        console.error('Failed to extract gas costs:', error);
        return '0.00';
    }
}

/**
 * Calculate total estimated execution time
 * @param route - The LI.FI route
 * @returns Total time in seconds
 */
export function calculateTotalTime(route: Route): number {
    try {
        if (!route?.steps) return 0;

        return route.steps.reduce((acc, step) => {
            return acc + (step.estimate?.executionDuration || 0);
        }, 0);
    } catch (error) {
        console.error('Failed to calculate total time:', error);
        return 0;
    }
}

/**
 * Extract primary DEX name from route
 * @param route - The LI.FI route
 * @returns DEX name or undefined
 */
export function extractDexName(route: Route): string | undefined {
    if (!route?.steps) return undefined;
    const swapStep = route.steps.find(isSwapStep);
    return swapStep?.toolDetails?.name || 'Unknown DEX';
}

/**
 * Extract bridge name from route
 * @param route - The LI.FI route
 * @returns Bridge name or undefined
 */
export function extractBridgeName(route: Route): string | undefined {
    if (!route?.steps) return undefined;
    const bridgeStep = route.steps.find(isBridgeStep);
    return bridgeStep?.toolDetails?.name;
}

/**
 * Format route for UI display with extracted metadata
 * @param route - Raw LI.FI route
 * @param vaultName - Optional vault name from ENS
 * @returns KiteRoute with display-friendly data
 */
export function formatRouteForDisplay(
    route: Route,
    vaultName?: string
): KiteRoute {
    // Handle null or invalid route objects
    if (!route) {
        return {
            id: '',
            fromChainId: 0,
            toChainId: 0,
            fromAmount: '0',
            toAmount: '0',
            steps: [],
            fromToken: {} as any,
            toToken: {} as any,
            fromAddress: '',
            toAddress: '',
            totalGasCostUSD: '0.00',
            totalTimeEstimate: 0,
            dexName: undefined,
            bridgeName: undefined,
            vaultName,
        } as unknown as KiteRoute;
    }

    return {
        ...route,
        totalGasCostUSD: extractGasCosts(route),
        totalTimeEstimate: calculateTotalTime(route),
        dexName: extractDexName(route),
        bridgeName: extractBridgeName(route),
        vaultName,
    };
}

/**
 * Get step type from LI.FI step
 * @param step - LI.FI step
 * @returns Simplified step type
 */
export function getStepType(step: LiFiStep): 'swap' | 'bridge' | 'deposit' {
    if (isSwapStep(step)) return 'swap';
    if (isBridgeStep(step)) return 'bridge';
    if (isContractCallStep(step)) return 'deposit';
    // Default to swap for unknown types
    return 'swap';
}

/**
 * Create initial execution progress from route
 * @param route - The route to execute
 * @returns Initial progress state
 */
export function createInitialProgress(route: Route): ExecutionProgress {
    if (!route?.steps) {
        return {
            currentStep: 0,
            totalSteps: 0,
            steps: [],
            status: 'pending', // ✅ Added
        };
    }

    return {
        currentStep: 0,
        totalSteps: route.steps.length,
        status: 'pending', // ✅ Added
        steps: route.steps.map((step) => ({
            type: getStepType(step),
            status: 'pending',
            name: step.toolDetails?.name,
        })),
    };
}

/**
 * Validate route request parameters
 * @param request - Route request to validate
 * @throws Error if validation fails
 */
export function validateRouteRequest(request: KiteRouteRequest): void {
    if (!request.fromToken || !request.toToken) {
        throw new Error('From and to tokens are required');
    }

    if (!request.fromAmount || request.fromAmount === '0') {
        throw new Error('Amount must be greater than 0');
    }

    if (!request.fromAddress || !request.toAddress) {
        throw new Error('From and to addresses are required');
    }

    if (request.fromToken.chainId === request.toToken.chainId &&
        request.fromToken.address.toLowerCase() === request.toToken.address.toLowerCase()) {
        throw new Error('Cannot swap token to itself on the same chain');
    }
}

/**
 * Sort routes by best option (lowest cost + fastest time)
 * @param routes - Array of routes to sort
 * @returns Sorted array with best route first
 */
export function sortRoutesByBest(routes: KiteRoute[]): KiteRoute[] {
    return [...routes].sort((a, b) => {
        // Calculate score: lower gas cost and faster time = better
        const scoreA =
            parseFloat(a.totalGasCostUSD) + a.totalTimeEstimate / 100;
        const scoreB =
            parseFloat(b.totalGasCostUSD) + b.totalTimeEstimate / 100;

        return scoreA - scoreB;
    });
}