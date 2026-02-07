'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RouteDisplay } from './RouteDisplay';
import type { KiteRoute, ExecutionProgress } from '@/lib/lifi/types';
import type { ENSProfile } from '@/types/ens';
import { formatUSD } from '@/lib/utils/formatters';
import { useAccount } from 'wagmi';

interface StepStatus {
    step: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    txHash?: string;
    error?: string;
}

interface ConfirmTransactionProps {
    route: KiteRoute;
    recipientProfile: ENSProfile;
    onExecute: () => void;
    isExecuting: boolean;
    onCancel?: () => void;
    progress?: ExecutionProgress | null;
    error?: Error | null;
}

export function ConfirmTransaction({
    route,
    recipientProfile,
    onExecute,
    isExecuting,
    onCancel,
    progress,
    error,
}: ConfirmTransactionProps) {
    // Derive execution status from progress
    const executionSteps = progress?.steps.map((step) => ({
        step: step.name || step.type.charAt(0).toUpperCase() + step.type.slice(1),
        status: step.status === 'executing' ? 'in-progress' : step.status,
        txHash: step.txHash,
        error: step.error,
    })) || [];

    const hasStarted = executionSteps.length > 0;
    const hasFailed = executionSteps.some((s) => s.status === 'failed');

    // ✅ Check if any transaction has been submitted
    const hasSubmittedTx = executionSteps.some((s) => s.txHash);

    // ✅ Check if all steps have tx hashes (optimistic completion)
    const allStepsSubmitted = executionSteps.length > 0 &&
        executionSteps.every((s) => s.txHash || s.status === 'completed');

    // Check if chain switch is needed
    const { chain } = useAccount();
    const needsChainSwitch = useMemo(() => {
        const currentChainId = chain?.id;
        return currentChainId !== route.fromChainId;
    }, [chain?.id, route.fromChainId]);

    // ✅ Get correct block explorer URL
    const getExplorerUrl = (chainId: number, txHash: string) => {
        const explorers: Record<number, string> = {
            1: 'https://etherscan.io',
            8453: 'https://basescan.org',
            42161: 'https://arbiscan.io',
            137: 'https://polygonscan.com',
        };
        const baseUrl = explorers[chainId] || 'https://etherscan.io';
        return `${baseUrl}/tx/${txHash}`;
    };

    return (
        <div className="space-y-6">
            {/* Route Summary */}
            <RouteDisplay route={route} isLoading={false} />

            {/* Chain Switch Notice */}
            {needsChainSwitch && !hasStarted && (
                <div className="bg-cyber-yellow/10 border border-cyber-yellow rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-charcoal">Chain Switch Required</p>
                            <p className="text-sm text-slate mt-1">
                                You'll be prompted to switch to the correct network before execution.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Box */}
            {!hasStarted && (
                <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-charcoal">Important</p>
                            <p className="text-sm text-slate mt-1">
                                You will sign transactions to approve and execute this route.
                                LI.FI will handle the cross-chain bridging and swapping automatically.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Optimistic Success Banner */}
            {hasSubmittedTx && !hasFailed && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 shadow-soft animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900">
                                {allStepsSubmitted ? '✅ Transaction Submitted Successfully!' : '⏳ Transaction Submitted'}
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                                {allStepsSubmitted
                                    ? 'Your transaction is being processed on-chain. You can view the details below.'
                                    : 'Your transaction has been broadcast to the network. Waiting for confirmation...'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Execution Progress */}
            {hasStarted && (
                <div className="bg-white border border-silver rounded-xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">
                        {allStepsSubmitted ? 'Transaction Details' : 'Transaction Progress'}
                    </h3>

                    <div className="space-y-4">
                        {executionSteps.map((stepStatus, index) => {
                            // Determine which chain to use for explorer link
                            const explorerChainId = stepStatus.step.toLowerCase().includes('bridge')
                                ? route.fromChainId
                                : route.fromChainId;

                            return (
                                <div key={index} className="flex items-start gap-4">
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {/* ✅ Show checkmark if has txHash (optimistic) */}
                                        {stepStatus.txHash ? (
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center animate-in zoom-in duration-300">
                                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : stepStatus.status === 'in-progress' ? (
                                            <div className="w-6 h-6">
                                                <LoadingSpinner size="sm" />
                                            </div>
                                        ) : stepStatus.status === 'failed' ? (
                                            <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-light-grey border border-silver" />
                                        )}
                                    </div>

                                    {/* Step Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-charcoal">{stepStatus.step}</span>

                                            {/* ✅ Better status badges */}
                                            {stepStatus.txHash ? (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                    Submitted ✓
                                                </span>
                                            ) : stepStatus.status === 'in-progress' ? (
                                                <span className="px-2 py-0.5 bg-cyber-yellow/20 text-cyber-yellow text-xs font-semibold rounded-full animate-pulse">
                                                    Signing...
                                                </span>
                                            ) : stepStatus.status === 'failed' ? (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                                    Failed
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Transaction Hash Link */}
                                        {stepStatus.txHash && (

                                         <a   href = { getExplorerUrl(explorerChainId, stepStatus.txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-cyber-yellow hover:text-cyber-yellow-dark mt-2 inline-flex items-center gap-1 font-medium group"
                                            >
                                        <span>View on Explorer</span>
                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                        )}

                                    {/* ✅ Additional info for pending confirmations */}
                                    {stepStatus.txHash && stepStatus.step.toLowerCase().includes('bridge') && (
                                        <p className="text-xs text-slate mt-1">
                                            ⏱️ Bridge confirmations may take 2-5 minutes
                                        </p>
                                    )}

                                    {/* Error Message */}
                                    {stepStatus.error && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">{stepStatus.error}</p>
                                    )}
                                </div>
                                </div>
                    );
                        })}
                </div>

                    {/* ✅ Processing Notice */}
            {hasSubmittedTx && !allStepsSubmitted && (
                <div className="mt-4 pt-4 border-t border-silver">
                    <p className="text-xs text-slate text-center">
                        Your transaction is being processed. This page will update automatically.
                    </p>
                </div>
            )}
        </div>
    )
}

{/* Action Button */ }
<div className="space-y-4">
    {!hasStarted && (
        <div className="bg-white border border-silver rounded-lg p-4 shadow-soft">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate">Estimated Total Cost</span>
                <span className="text-lg font-semibold text-charcoal">
                    {route.gasCostUSD ? formatUSD(route.gasCostUSD) : 'Calculating...'}
                </span>
            </div>
        </div>
    )}

    <Button
        onClick={onExecute}
        size="lg"
        className="w-full"
        isLoading={isExecuting}
        disabled={isExecuting || hasFailed}
    >
        {hasFailed ? 'Transaction Failed' : isExecuting ? 'Processing...' : 'Confirm & Send'}
    </Button>

    {hasFailed && (
        <div className="text-center">
            <p className="text-sm text-red-500 font-medium mb-2">
                Transaction failed to execute
            </p>
            <p className="text-xs text-slate">
                Please try again or contact support if the issue persists
            </p>
        </div>
    )}

    {/* ✅ Back button during execution */}
    {hasStarted && onCancel && !allStepsSubmitted && (
        <Button
            variant="secondary"
            onClick={onCancel}
            className="w-full"
            disabled={isExecuting}
        >
            Go Back
        </Button>
    )}
</div>
        </div >
    );
}