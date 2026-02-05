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
                    <div className="text-center py-8 text-red-500">
                        <p>Failed to load balances</p>
                        <p className="text-sm text-slate mt-2">{error.message}</p>
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
                    <div className="text-center p-6 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-xl shadow-soft">
                        <p className="text-sm text-slate mb-2">Total Portfolio Value</p>
                        <p className="text-4xl font-bold text-charcoal">{formatUSD(totalValue)}</p>
                    </div>

                    {/* Chain Breakdown */}
                    {Object.keys(balancesByChain).length === 0 ? (
                        <div className="text-center py-8 text-slate">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-slate/50"
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
                            <p className="text-lg font-medium text-charcoal">No balances found</p>
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
                                        className="bg-white border border-silver rounded-lg overflow-hidden hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedChain(isExpanded ? null : Number(chainId))
                                            }
                                            className="w-full p-4 text-left hover:bg-light-grey transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-yellow to-cyber-yellow-dark flex items-center justify-center text-charcoal text-sm font-bold shadow-soft">
                                                        {chainData.chainName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-charcoal">
                                                        {chainData.chainName}
                                                    </span>
                                                </div>
                                                <svg
                                                    className={`w-5 h-5 text-slate transition-transform ${isExpanded ? 'rotate-180' : ''
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

                                            <p className="text-2xl font-bold text-charcoal mb-2">
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
                                                            <span className="text-slate">
                                                                {token.token.symbol}
                                                            </span>
                                                            <span className="text-charcoal font-medium">
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
                                            <div className="border-t border-silver p-4 space-y-2 bg-light-grey/50">
                                                {chainData.tokens.map((token) => (
                                                    <div
                                                        key={`${token.chainId}-${token.token.address}`}
                                                        className="flex items-center justify-between p-2 bg-white rounded border border-silver"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-yellow to-cyber-yellow-dark flex items-center justify-center text-charcoal text-xs font-bold">
                                                                {token.token.symbol.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-charcoal">
                                                                {token.token.symbol}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-charcoal">
                                                                {formatTokenAmount(
                                                                    token.balance,
                                                                    token.token.decimals,
                                                                    4
                                                                )}
                                                            </p>
                                                            {token.balanceUSD && (
                                                                <p className="text-xs text-slate">
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
