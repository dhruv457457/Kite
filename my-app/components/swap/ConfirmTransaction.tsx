'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RouteDisplay } from './RouteDisplay';
import type { KiteRoute, ExecutionProgress } from '@/lib/lifi/types';
import type { ENSProfile } from '@/types/ens';
import { formatUSD } from '@/lib/utils/formatters';

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

    return (
        <div className="space-y-6">
            {/* Route Summary */}
            <RouteDisplay route={route} isLoading={false} />

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

            {/* Execution Progress */}
            {hasStarted && (
                <div className="bg-white border border-silver rounded-xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">Transaction Progress</h3>

                    <div className="space-y-4">
                        {executionSteps.map((stepStatus, index) => (
                            <div key={index} className="flex items-start gap-4">
                                {/* Status Icon */}
                                <div className="flex-shrink-0 mt-1">
                                    {stepStatus.status === 'completed' && (
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    {stepStatus.status === 'in-progress' && (
                                        <div className="w-6 h-6">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    )}

                                    {stepStatus.status === 'failed' && (
                                        <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    )}

                                    {stepStatus.status === 'pending' && (
                                        <div className="w-6 h-6 rounded-full bg-light-grey border border-silver" />
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-charcoal">{stepStatus.step}</span>
                                        {stepStatus.status === 'in-progress' && (
                                            <span className="text-sm text-cyber-yellow font-semibold">Processing...</span>
                                        )}
                                        {stepStatus.status === 'completed' && (
                                            <span className="text-sm text-green-500">Done</span>
                                        )}
                                        {stepStatus.status === 'failed' && (
                                            <span className="text-sm text-red-500">Failed</span>
                                        )}
                                    </div>

                                    {stepStatus.txHash && (
                                        <a
                                            href={`https://etherscan.io/tx/${stepStatus.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-cyber-yellow hover:text-cyber-yellow-dark mt-1 inline-block font-medium"
                                        >
                                            View transaction →
                                        </a>
                                    )}

                                    {stepStatus.error && (
                                        <p className="text-xs text-red-500 mt-1">{stepStatus.error}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Button */}
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
                    {hasFailed ? 'Transaction Failed' : 'Confirm & Send'}
                </Button>

                {hasFailed && (
                    <p className="text-center text-sm text-slate">
                        Please try again or contact support if the issue persists
                    </p>
                )}
            </div>
        </div>
    );
}
