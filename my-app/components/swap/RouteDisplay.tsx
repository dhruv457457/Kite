'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { KiteRoute } from '@/lib/lifi/types';
import { isSwapStep, isBridgeStep, isContractCallStep } from '@/lib/lifi/types';
import { formatUSD, formatDuration } from '@/lib/utils/formatters';
import { formatUnits } from 'viem';

interface RouteDisplayProps {
    route: KiteRoute | null;
    isLoading: boolean;
}

export function RouteDisplay({ route, isLoading }: RouteDisplayProps) {
    // ✅ Calculate total gas cost from all steps
    const totalGasCostUSD = useMemo(() => {
        if (!route || !route.steps || route.steps.length === 0) return null;

        let total = 0;
        for (const step of route.steps) {
            if (step.estimate?.gasCosts) {
                for (const gasCost of step.estimate.gasCosts) {
                    if (gasCost.amountUSD) {
                        total += parseFloat(gasCost.amountUSD);
                    }
                }
            }
        }

        return total > 0 ? total.toString() : null;
    }, [route]);

    // ✅ Calculate total duration from all steps
    const totalDuration = useMemo(() => {
        if (!route || !route.steps || route.steps.length === 0) return 0;

        return route.steps.reduce(
            (sum, step) => sum + (step.estimate?.executionDuration || 0),
            0
        );
    }, [route]);

    // ✅ Get the final output amount and token
    const outputAmount = useMemo(() => {
        if (!route || !route.steps || route.steps.length === 0) return null;

        const lastStep = route.steps[route.steps.length - 1];
        if (!lastStep.action?.toToken || !lastStep.estimate?.toAmount) return null;

        try {
            const token = lastStep.action.toToken;
            const amount = formatUnits(
                BigInt(lastStep.estimate.toAmount),
                token.decimals || 18
            );

            return {
                amount: parseFloat(amount).toFixed(6),
                symbol: token.symbol,
            };
        } catch (error) {
            console.error('Error formatting output amount:', error);
            return null;
        }
    }, [route]);

    // ✅ Get slippage from first step
    const slippage = useMemo(() => {
        if (!route || !route.steps || route.steps.length === 0) return 0.5;
        return route.steps[0]?.action?.slippage || 0.5;
    }, [route]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Finding Best Route</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-zinc-400">Analyzing routes across chains...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!route || !route.steps || route.steps.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-zinc-400">No route data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Route Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Route Steps Pipeline */}
                    <div className="space-y-4">
                        {route.steps.map((step, index) => {
                            // ✅ Calculate gas cost for this specific step
                            const stepGasCost = step.estimate?.gasCosts?.reduce(
                                (sum, cost) => sum + parseFloat(cost.amountUSD || '0'),
                                0
                            ) || 0;

                            return (
                                <div key={index}>
                                    {/* Step Card */}
                                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Step Icon */}
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                                {isSwapStep(step) && (
                                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                )}
                                                {isBridgeStep(step) && (
                                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                )}
                                                {isContractCallStep(step) && (
                                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Step Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-medium text-cyan-400 uppercase">
                                                        {step.type || 'unknown'}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">•</span>
                                                    <span className="text-sm font-medium text-white">
                                                        {step.toolDetails?.name || 'Unknown Tool'}
                                                    </span>
                                                </div>

                                                {step.action && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                        <span>{step.action.fromToken?.symbol || '?'}</span>
                                                        <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                        <span>{step.action.toToken?.symbol || '?'}</span>
                                                    </div>
                                                )}

                                                <div className="mt-2 text-xs text-zinc-500">
                                                    Gas: {stepGasCost > 0 ? formatUSD(stepGasCost.toString()) : '$0.00'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow Between Steps */}
                                    {index < route.steps.length - 1 && (
                                        <div className="flex justify-center my-2">
                                            <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Route Summary */}
                    <div className="border-t border-zinc-800 pt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Total Gas Cost</span>
                            <span className="font-medium text-white">
                                {totalGasCostUSD ? formatUSD(totalGasCostUSD) : '$0.00'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Estimated Time</span>
                            <span className="font-medium text-white">
                                ~{formatDuration(totalDuration)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Slippage Tolerance</span>
                            <span className="font-medium text-white">
                                {slippage}%
                            </span>
                        </div>

                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-cyan-400">You Receive</span>
                                <span className="text-lg font-bold text-cyan-400">
                                    {outputAmount
                                        ? `${outputAmount.amount} ${outputAmount.symbol}`
                                        : 'Calculating...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Route Tags */}
                    {route.tags && route.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {route.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-400 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}