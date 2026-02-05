import { useState, useCallback } from 'react';
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

export default function useLifiExecute(): UseLifiExecuteResult {
    const [isExecuting, setIsExecuting] = useState(false);
    const [progress, setProgress] = useState<ExecutionProgress | null>(null);
    const [txHashes, setTxHashes] = useState<{
        swap?: string;
        bridge?: string;
        deposit?: string;
    }>({});
    const [error, setError] = useState<Error | null>(null);

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

    const collectTxHash = useCallback((type: 'swap' | 'bridge' | 'deposit', hash: string) => {
        setTxHashes((prev) => ({
            ...prev,
            [type]: hash,
        }));
    }, []);

    const executeRoute = useCallback(
        async (route: KiteRoute, callbacks?: ExecutionCallbacks) => {
            // Validation
            if (!route || !route.steps || route.steps.length === 0) {
                const error = new Error('Invalid route');
                setError(error);
                callbacks?.onError?.(error);
                return;
            }

            // ✅ CRITICAL: Log the route we're about to execute
            console.log('🚀 Executing route:', {
                id: route.id,
                fromAmount: (route as any).fromAmount,
                steps: route.steps.length,
                firstStepAction: route.steps[0]?.action,
            });

            // Reset state
            setIsExecuting(true);
            setError(null);
            setTxHashes({});
            setProgress(createInitialProgress(route));

            try {
                console.log('🚀 Starting route execution with', route.steps.length, 'steps');

                // ✅ CRITICAL: Pass the route object EXACTLY as received from getQuote/getRoutes
                // DO NOT modify route.fromAmount or any step amounts
                const result = await sdkExecuteRoute(route, {
                    updateRouteHook: (updatedRoute: any) => {
                        try {
                            console.log('📡 Route update received:', {
                                status: updatedRoute.status,
                                steps: updatedRoute.steps?.length,
                            });

                            // Find current executing step
                            const executingStepIndex = updatedRoute.steps.findIndex(
                                (step: any) =>
                                    step.execution?.status === 'PENDING' ||
                                    step.execution?.status === 'ACTION_REQUIRED'
                            );

                            if (executingStepIndex !== -1) {
                                const step = updatedRoute.steps[executingStepIndex];
                                const stepType = getStepType(step);

                                console.log(`⏳ Step ${executingStepIndex + 1} executing:`, stepType);

                                updateStepProgress(
                                    executingStepIndex,
                                    'executing'
                                );

                                if (step.execution?.process?.[0]?.txHash) {
                                    const txHash = step.execution.process[0].txHash;
                                    console.log(`✅ Transaction hash for ${stepType}:`, txHash);
                                    collectTxHash(stepType, txHash);
                                    updateStepProgress(executingStepIndex, 'executing', txHash);
                                }

                                callbacks?.onStepUpdate?.(executingStepIndex, 'executing');
                            }

                            // Check for completed steps
                            updatedRoute.steps.forEach((step: any, index: number) => {
                                if (step.execution?.status === 'DONE') {
                                    const stepType = getStepType(step);
                                    const txHash = step.execution?.process?.[0]?.txHash;

                                    console.log(`✅ Step ${index + 1} completed:`, stepType);

                                    updateStepProgress(index, 'completed', txHash);

                                    if (txHash) {
                                        collectTxHash(stepType, txHash);
                                    }
                                }

                                if (step.execution?.status === 'FAILED') {
                                    const errorMsg =
                                        step.execution?.process?.[0]?.error?.message || 'Step failed';
                                    console.error(`❌ Step ${index + 1} failed:`, errorMsg);
                                    updateStepProgress(index, 'failed', undefined, errorMsg);
                                }
                            });
                        } catch (err) {
                            console.error('Error processing route update:', err);
                        }
                    },

                    acceptExchangeRateUpdateHook: async (update: any) => {
                        const { toToken, oldToAmount, newToAmount } = update;

                        const oldAmountNum = parseFloat(oldToAmount);
                        const newAmountNum = parseFloat(newToAmount);

                        const percentChange = Math.abs(
                            ((newAmountNum - oldAmountNum) / oldAmountNum) * 100
                        ).toFixed(2);

                        const isIncrease = newAmountNum > oldAmountNum;

                        const message = isIncrease
                            ? `Exchange rate improved by ${percentChange}%. You'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}. Accept new rate?`
                            : `Exchange rate decreased by ${percentChange}%. You'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}. Continue anyway?`;

                        console.log('⚠️ Exchange rate update:', message);

                        const accepted = window.confirm(message);

                        if (!accepted) {
                            throw new Error('User rejected exchange rate update');
                        }

                        return accepted;
                    },

                    infiniteApproval: false,
                });

                // Mark all steps as completed
                if (progress) {
                    progress.steps.forEach((_, index) => {
                        updateStepProgress(index, 'completed');
                    });
                }

                console.log('✅ Route execution completed successfully');

                callbacks?.onSuccess?.(result);
            } catch (err) {
                const error =
                    err instanceof Error ? err : new Error('Transaction execution failed');

                console.error('❌ Execution error:', error);
                setError(error);

                if (progress) {
                    updateStepProgress(
                        progress.currentStep,
                        'failed',
                        undefined,
                        error.message
                    );
                }

                callbacks?.onError?.(error);
            } finally {
                setIsExecuting(false);
            }
        },
        [progress, updateStepProgress, collectTxHash]
    );

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