'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import useTokenBalance from '@/hooks/useTokenBalance';
import { formatTokenAmount, formatUSD } from '@/lib/utils/formatters';
import { getChainNameFromId } from '@/lib/ens/textRecords';

export function PortfolioBalance() {
    const { balances, isLoading, error } = useTokenBalance();
    const [expandedChain, setExpandedChain] = useState<number | null>(null);

    // Calculate total portfolio value
    const totalValue = useMemo(() => {
        return balances.reduce((sum, balance) => {
            if (balance.balanceUSD) {
                return sum + parseFloat(balance.balanceUSD);
            }
            return sum;
        }, 0);
    }, [balances]);

    // Group balances by chain
    const balancesByChain = useMemo(() => {
        const grouped: Record<
            number,
            {
                chainName: string;
                totalUSD: number;
                tokens: typeof balances;
            }
        > = {};

        balances.forEach((balance) => {
            if (!grouped[balance.chainId]) {
                grouped[balance.chainId] = {
                    chainName: balance.chainName,
                    totalUSD: 0,
                    tokens: [],
                };
            }

            grouped[balance.chainId].tokens.push(balance);
            if (balance.balanceUSD) {
                grouped[balance.chainId].totalUSD += parseFloat(balance.balanceUSD);
            }
        });

        return grouped;
    }, [balances]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-400">
                        <p>Failed to load balances</p>
                        <p className="text-sm text-zinc-500 mt-2">{error.message}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Portfolio Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Total Portfolio Value */}
                    <div className="text-center p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
                        <p className="text-sm text-cyan-400 mb-2">Total Portfolio Value</p>
                        <p className="text-4xl font-bold text-white">{formatUSD(totalValue)}</p>
                    </div>

                    {/* Chain Breakdown */}
                    {Object.keys(balancesByChain).length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-zinc-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <p className="text-lg font-medium">No balances found</p>
                            <p className="text-sm mt-1">Add funds to your wallet to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(balancesByChain).map(([chainId, chainData]) => {
                                const isExpanded = expandedChain === Number(chainId);
                                const topTokens = chainData.tokens.slice(0, 2);

                                return (
                                    <div
                                        key={chainId}
                                        className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedChain(isExpanded ? null : Number(chainId))
                                            }
                                            className="w-full p-4 text-left hover:bg-zinc-800 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                                        {chainData.chainName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-white">
                                                        {chainData.chainName}
                                                    </span>
                                                </div>
                                                <svg
                                                    className={`w-5 h-5 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                                                        }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>

                                            <p className="text-2xl font-bold text-white mb-2">
                                                {formatUSD(chainData.totalUSD)}
                                            </p>

                                            {/* Top 2 Tokens (when collapsed) */}
                                            {!isExpanded && (
                                                <div className="space-y-1">
                                                    {topTokens.map((token) => (
                                                        <div
                                                            key={`${token.chainId}-${token.token.address}`}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span className="text-zinc-400">
                                                                {token.token.symbol}
                                                            </span>
                                                            <span className="text-zinc-300">
                                                                {formatTokenAmount(
                                                                    token.balance,
                                                                    token.token.decimals,
                                                                    4
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </button>

                                        {/* Expanded Token List */}
                                        {isExpanded && (
                                            <div className="border-t border-zinc-700 p-4 space-y-2">
                                                {chainData.tokens.map((token) => (
                                                    <div
                                                        key={`${token.chainId}-${token.token.address}`}
                                                        className="flex items-center justify-between p-2 bg-zinc-900/50 rounded"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                                {token.token.symbol.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-white">
                                                                {token.token.symbol}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-white">
                                                                {formatTokenAmount(
                                                                    token.balance,
                                                                    token.token.decimals,
                                                                    4
                                                                )}
                                                            </p>
                                                            {token.balanceUSD && (
                                                                <p className="text-xs text-zinc-500">
                                                                    {formatUSD(token.balanceUSD)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
