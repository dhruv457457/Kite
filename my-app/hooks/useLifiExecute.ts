'use client';

import { useState, useCallback } from 'react';
import { executeRoute as sdkExecuteRoute } from '@lifi/sdk';
import { useAccount, useSwitchChain } from 'wagmi';
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
    const { address, chain } = useAccount();
    const { switchChainAsync } = useSwitchChain();

    const [isExecuting, setIsExecuting] = useState(false);
    const [progress, setProgress] = useState<ExecutionProgress | null>(null);
    const [txHashes, setTxHashes] = useState<{
        swap?: string;
        bridge?: string;
        deposit?: string;
    }>({});
    const [error, setError] = useState<Error | null>(null);
    const [hasCalledSuccess, setHasCalledSuccess] = useState(false);

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
        console.log(`💾 Collecting ${type} tx hash:`, hash);
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

            if (!address) {
                const error = new Error('Wallet not connected');
                setError(error);
                callbacks?.onError?.(error);
                return;
            }

            console.log('🚀 Executing route:', {
                id: route.id,
                fromAmount: (route as any).fromAmount,
                fromChainId: route.fromChainId,
                steps: route.steps.length,
            });

            // Reset state
            setIsExecuting(true);
            setError(null);
            setTxHashes({});
            setHasCalledSuccess(false);
            setProgress(createInitialProgress(route));

            try {
                // Chain switching logic
                const requiredChainId = route.fromChainId;
                const currentChainId = chain?.id;

                console.log('🔍 Chain Check:', {
                    required: requiredChainId,
                    current: currentChainId,
                    needsSwitch: currentChainId !== requiredChainId,
                });

                if (currentChainId !== requiredChainId) {
                    console.log(`🔄 Switching from chain ${currentChainId} to ${requiredChainId}...`);

                    setProgress({
                        status: 'executing',
                        currentStep: 0,
                        totalSteps: route.steps.length,
                        steps: [{
                            type: 'chain-switch',
                            name: 'Switching Network',
                            status: 'executing',
                        }],
                    });

                    try {
                        await switchChainAsync({ chainId: requiredChainId });
                        console.log('✅ Chain switched successfully!');
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        setProgress(createInitialProgress(route));
                    } catch (switchError) {
                        console.error('❌ Chain switch failed:', switchError);
                        throw new Error(
                            `Please switch to the correct network in your wallet.\nRequired: Chain ID ${requiredChainId}`
                        );
                    }
                }

                console.log('🚀 Starting route execution with', route.steps.length, 'steps');

                // Execute the route via LI.FI SDK
                const executionPromise = sdkExecuteRoute(route, {
                    updateRouteHook: (updatedRoute: any) => {
                        try {
                            console.log('📡 Route update received:', {
                                status: updatedRoute.status,
                                steps: updatedRoute.steps?.length,
                            });

                            // Track transaction hashes and optimistically mark as completed
                            const allTxHashes: string[] = [];

                            updatedRoute.steps.forEach((step: any, index: number) => {
                                const stepType = getStepType(step);
                                const stepStatus = step.execution?.status || 'PENDING';
                                const txHash = step.execution?.process?.[0]?.txHash;

                                // Collect tx hash
                                if (txHash) {
                                    allTxHashes.push(txHash);
                                    collectTxHash(stepType, txHash);
                                }

                                // OPTIMISTIC: Mark as completed if tx is submitted (has txHash)
                                if (txHash) {
                                    console.log(`✅ Step ${index + 1} tx submitted: ${stepType} - ${txHash.slice(0, 10)}...`);
                                    updateStepProgress(index, 'completed', txHash);
                                } else if (stepStatus === 'ACTION_REQUIRED' || stepStatus === 'PENDING') {
                                    console.log(`⏳ Step ${index + 1} executing: ${stepType}`);
                                    updateStepProgress(index, 'executing');
                                } else if (stepStatus === 'DONE') {
                                    console.log(`✅ Step ${index + 1} completed: ${stepType}`);
                                    updateStepProgress(index, 'completed', txHash);
                                } else if (stepStatus === 'FAILED') {
                                    const errorMsg = step.execution?.process?.[0]?.error?.message || 'Step failed';
                                    console.error(`❌ Step ${index + 1} failed:`, errorMsg);
                                    updateStepProgress(index, 'failed', undefined, errorMsg);
                                }
                            });

                            // EARLY SUCCESS: Call success callback once all steps have txHashes
                            const allStepsSubmitted = updatedRoute.steps.length > 0 &&
                                updatedRoute.steps.every((step: any) => step.execution?.process?.[0]?.txHash);

                            if (allStepsSubmitted && !hasCalledSuccess && callbacks?.onSuccess) {
                                console.log('🎉 All transactions submitted! Calling success callback...');
                                setHasCalledSuccess(true);

                                // Small delay for better UX (let user see the completion animation)
                                setTimeout(() => {
                                    callbacks.onSuccess?.(updatedRoute);
                                    setIsExecuting(false);
                                }, 1500);
                            }

                            // Call step update callback
                            const executingStepIndex = updatedRoute.steps.findIndex(
                                (step: any) =>
                                    step.execution?.status === 'PENDING' ||
                                    step.execution?.status === 'ACTION_REQUIRED'
                            );

                            if (executingStepIndex !== -1) {
                                callbacks?.onStepUpdate?.(executingStepIndex, 'executing');
                            }

                        } catch (err) {
                            console.error('❌ Error processing route update:', err);
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
                            ? `✅ Exchange rate improved by ${percentChange}%!\n\nYou'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}.\n\nAccept new rate?`
                            : `⚠️ Exchange rate decreased by ${percentChange}%.\n\nYou'll receive ${newAmountNum} ${toToken.symbol} instead of ${oldAmountNum}.\n\nContinue anyway?`;

                        console.log('💱 Exchange rate update:', message);

                        // Auto-accept improvements
                        if (isIncrease) {
                            console.log('✅ Auto-accepting rate improvement');
                            return true;
                        }

                        // For decreases, only prompt if significant (>1%)
                        if (parseFloat(percentChange) < 1) {
                            console.log('✅ Auto-accepting minor rate change (<1%)');
                            return true;
                        }

                        const accepted = window.confirm(message);

                        if (!accepted) {
                            throw new Error('User rejected exchange rate update');
                        }

                        return accepted;
                    },

                    infiniteApproval: false,
                });

                // Wait for execution to complete (but success is already shown)
                await executionPromise;

                console.log('✅ Route execution fully completed (including confirmations)');

                // Update final status
                setProgress(prev => prev ? { ...prev, status: 'completed' } : null);

                // ✅ FIX: Ensure success callback is called if not already called
                if (!hasCalledSuccess && callbacks?.onSuccess) {
                    console.log('🎉 Calling success callback after full completion (fallback)');
                    setHasCalledSuccess(true);
                    callbacks.onSuccess?.(route);
                }

                // ✅ Always stop executing state
                setIsExecuting(false);

            } catch (err) {
                const error = err instanceof Error ? err : new Error('Transaction execution failed');

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

                setIsExecuting(false);
                callbacks?.onError?.(error);
            }
        },
        [address, chain, switchChainAsync, progress, updateStepProgress, collectTxHash, hasCalledSuccess]
    );

    const reset = useCallback(() => {
        setIsExecuting(false);
        setProgress(null);
        setTxHashes({});
        setError(null);
        setHasCalledSuccess(false);
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