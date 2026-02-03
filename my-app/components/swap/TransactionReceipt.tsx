'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { KiteRoute } from '@/lib/lifi/types';
import type { ENSProfile } from '@/types/ens';
import { formatDate, formatTokenAmount, formatUSD } from '@/lib/utils/formatters';

interface TransactionReceiptProps {
    route: KiteRoute;
    recipientProfile: ENSProfile;
    txHashes: {
        swap?: string;
        bridge?: string;
        deposit?: string;
    };
    onStartOver: () => void;
}

export function TransactionReceipt({
    route,
    recipientProfile,
    txHashes,
    onStartOver,
}: TransactionReceiptProps) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Hide confetti after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

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
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    {/* Success Animation */}
                    <div className="text-center mb-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-in zoom-in duration-500">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl">Transaction Successful!</CardTitle>
                        <p className="text-zinc-400 mt-2">Your deposit has been sent</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        {/* Transaction Summary */}
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 space-y-4">
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">You sent</p>
                                <p className="text-lg font-semibold text-white">
                                    {route.fromAmount} {route.fromToken.symbol}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    {formatUSD(route.fromToken.priceUSD || '0')}
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm text-zinc-400 mb-1">{recipientProfile.name} received</p>
                                <p className="text-lg font-semibold text-white">
                                    {route.toAmount} {route.toToken.symbol}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    {formatUSD(route.toToken.priceUSD || '0')}
                                </p>
                            </div>
                        </div>

                        {/* Route Taken */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-3">Route Taken</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                {route.steps.map((step, index) => (
                                    <React.Fragment key={index}>
                                        <div className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                                            {step.toolDetails.name}
                                        </div>
                                        {index < route.steps.length - 1 && (
                                            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Transaction Hashes */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-3">Transaction Details</h4>
                            <div className="space-y-2">
                                {txHashes.swap && (
                                    <a
                                        href={getExplorerUrl(route.fromChainId, txHashes.swap)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-cyan-500 transition-colors"
                                    >
                                        <span className="text-sm text-white">Swap Transaction</span>
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}

                                {txHashes.bridge && (
                                    <a
                                        href={getExplorerUrl(route.fromChainId, txHashes.bridge)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-cyan-500 transition-colors"
                                    >
                                        <span className="text-sm text-white">Bridge Transaction</span>
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}

                                {txHashes.deposit && (
                                    <a
                                        href={getExplorerUrl(route.toChainId, txHashes.deposit)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-cyan-500 transition-colors"
                                    >
                                        <span className="text-sm text-white">Deposit Transaction</span>
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-zinc-800">
                            <span className="text-zinc-400">Completed</span>
                            <span className="text-white">{formatDate(Date.now())}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button variant="secondary" onClick={onStartOver} className="w-full">
                                Send Another
                            </Button>
                            <Button variant="ghost" className="w-full">
                                View History
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confetti Effect (CSS-only) */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
