import { useState, useCallback } from 'react';
import { useWalletClient, useSwitchChain } from 'wagmi';
import { executeRoute as sdkExecuteRoute } from '@lifi/sdk';
import type { KiteRoute } from '@/lib/lifi/types';
import {
    createInitialProgress,
    getStepType,
    type ExecutionProgress,
    type ExecutionCallbacks,
} from '@/lib/lifi/types';

interface UseLifiExecuteResult {
    executeRoute: (route: KiteRoute, callbacks?: ExecutionCallbacks) => Promise<void>;
    isExecuting: boolean;
    progress: ExecutionProgress | null;
    txHashes: {
        swap?: string;
        bridge?: string;
        deposit?: string;
    };
    error: Error | null;
    reset: () => void;
}

/**
 * Hook to execute LI.FI routes on-chain (V3 SDK)
 * 
 * This hook handles:
 * - Route execution via LI.FI SDK direct import
 * - Progress tracking for each step
 * - Chain switching when needed
 * - Transaction hash collection
 * - Error handling and recovery
 * 
 * In V3, executeRoute is imported directly from '@lifi/sdk'
 * and takes (route, options) where options contains:
 * - signer (walletClient from wagmi)
 * - updateRouteHook, switchChainHook, acceptExchangeRateUpdateHook
 * 
 * @returns Execution functions and state
 */
export default function useLifiExecute(): UseLifiExecuteResult {
    const [isExecuting, setIsExecuting] = useState(false);
    const [progress, setProgress] = useState<ExecutionProgress | null>(null);
    const [txHashes, setTxHashes] = useState<{
        swap?: string;
        bridge?: string;
        deposit?: string;
    }>({});
    const [error, setError] = useState<Error | null>(null);

    const { data: walletClient } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();

    /**
     * Update progress for a specific step
     */
    const updateStepProgress = useCallback(
        (
            stepIndex: number,
            status: 'pending' | 'executing' | 'completed' | 'failed',
            txHash?: string,
            errorMsg?: string
        ) => {
            setProgress((prev) => {
                if (!prev) return null;

                const newSteps = [...prev.steps];
                newSteps[stepIndex] = {
                    ...newSteps[stepIndex],
                    status,
                    txHash,
                    error: errorMsg,
                };

                return {
                    ...prev,
                    currentStep: stepIndex,
                    steps: newSteps,
                };
            });
        },
        []
    );

    /**
     * Collect transaction hash by step type
     */
    const collectTxHash = useCallback((type: 'swap' | 'bridge' | 'deposit', hash: string) => {
        setTxHashes((prev) => ({
            ...prev,
            [type]: hash,
        }));
    }, []);

    /**
     * Execute a route on-chain using V3 SDK
     */
    const executeRoute = useCallback(
        async (route: KiteRoute, callbacks?: ExecutionCallbacks) => {
            // Validation
            if (!walletClient) {
                const error = new Error('Wallet not connected');
                setError(error);
                callbacks?.onError?.(error);
                return;
            }

            if (!route || !route.steps || route.steps.length === 0) {
                const error = new Error('Invalid route');
                setError(error);
                callbacks?.onError?.(error);
                return;
            }

            // Reset state
            setIsExecuting(true);
            setError(null);
            setTxHashes({});
            setProgress(createInitialProgress(route));

            try {
                // Execute route with V3 SDK - direct function call
                // Signature: executeRoute(route, options)
                // Note: The SDK uses wallet providers configured through browser's injected wallet
                // or through the providers array in createConfig. WalletClient is not passed here.
                const result = await sdkExecuteRoute(route, {
                    /**
                     * Update hook: Called for each status update
                     */
                    updateRouteHook: (updatedRoute: any) => {
                        try {
                            // Find current executing step
                            const executingStepIndex = updatedRoute.steps.findIndex(
                                (step: any) =>
                                    step.execution?.status === 'PENDING' ||
                                    step.execution?.status === 'ACTION_REQUIRED'
                            );

                            if (executingStepIndex !== -1) {
                                const step = updatedRoute.steps[executingStepIndex];
                                const stepType = getStepType(step);

                                // Update progress
                                updateStepProgress(
                                    executingStepIndex,
                                    'executing'
                                );

                                // Collect transaction hash if available
                                if (step.execution?.process?.[0]?.txHash) {
                                    const txHash = step.execution.process[0].txHash;
                                    collectTxHash(stepType, txHash);
                                    updateStepProgress(executingStepIndex, 'executing', txHash);
                                }

                                // Call user callback
                                callbacks?.onStepUpdate?.(executingStepIndex, 'executing');
                            }

                            // Check for completed steps
                            updatedRoute.steps.forEach((step: any, index: number) => {
                                if (step.execution?.status === 'DONE') {
                                    const stepType = getStepType(step);
                                    const txHash = step.execution?.process?.[0]?.txHash;

                                    updateStepProgress(index, 'completed', txHash);

                                    if (txHash) {
                                        collectTxHash(stepType, txHash);
                                    }
                                }

                                if (step.execution?.status === 'FAILED') {
                                    const errorMsg =
                                        step.execution?.process?.[0]?.error?.message || 'Step failed';
                                    updateStepProgress(index, 'failed', undefined, errorMsg);
                                }
                            });
                        } catch (err) {
                            console.error('Error processing route update:', err);
                        }
                    },

                    /**
                     * Chain switch hook: Prompt user to switch chains
                     */
                    switchChainHook: async (requiredChainId: number) => {
                        try {
                            if (!switchChainAsync) {
                                throw new Error('Chain switching not supported');
                            }

                            await switchChainAsync({ chainId: requiredChainId });

                            // Return the walletClient (V3 expects signer back)
                            return walletClient;
                        } catch (err) {
                            throw new Error(
                                `Failed to switch to chain ${requiredChainId}: ${err instanceof Error ? err.message : 'Unknown error'
                                }`
                            );
                        }
                    },

                    /**
                     * Exchange rate update hook: Ask user to accept new rate
                     * SDK passes: { toToken, oldToAmount, newToAmount }
                     */
                    acceptExchangeRateUpdateHook: async ({ toToken, oldToAmount, newToAmount }) => {
                        // Convert amounts to numbers for comparison
                        const oldAmountNum = parseFloat(oldToAmount);
                        const newAmountNum = parseFloat(newToAmount);

                        // Calculate percentage change
                        const percentChange = Math.abs(
                            ((newAmountNum - oldAmountNum) / oldAmountNum) * 100
                        ).toFixed(2);

                        const isIncrease = newAmountNum > oldAmountNum;

                        const message = isIncrease
                            ? `Exchange rate improved by ${percentChange}%. You'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}. Accept new rate?`
                            : `Exchange rate decreased by ${percentChange}%. You'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}. Continue anyway?`;

                        // In production, you might want to show a modal instead
                        const accepted = window.confirm(message);

                        if (!accepted) {
                            throw new Error('User rejected exchange rate update');
                        }

                        return accepted;
                    },

                    /**
                     * Infinite approval: Always return false to use exact approval amounts
                     */
                    infiniteApproval: false,
                });

                // Mark all steps as completed
                if (progress) {
                    progress.steps.forEach((_, index) => {
                        updateStepProgress(index, 'completed');
                    });
                }

                // Success callback
                callbacks?.onSuccess?.(result);
            } catch (err) {
                const error =
                    err instanceof Error ? err : new Error('Transaction execution failed');

                console.error('Execution error:', error);
                setError(error);

                // Mark current step as failed
                if (progress) {
                    updateStepProgress(
                        progress.currentStep,
                        'failed',
                        undefined,
                        error.message
                    );
                }

                // Error callback
                callbacks?.onError?.(error);
            } finally {
                setIsExecuting(false);
            }
        },
        [walletClient, switchChainAsync, progress, updateStepProgress, collectTxHash]
    );

    /**
     * Reset execution state
     */
    const reset = useCallback(() => {
        setIsExecuting(false);
        setProgress(null);
        setTxHashes({});
        setError(null);
    }, []);

    return {
        executeRoute,
        isExecuting,
        progress,
        txHashes,
        error,
        reset,
    };
}
