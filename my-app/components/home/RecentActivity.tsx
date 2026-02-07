'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useBlockchainHistory, type BlockchainTransaction } from '@/hooks/useBlockchainHistory';
import { formatUnits } from 'viem';

interface RecentActivityProps {
    address: string;
    showAll?: boolean;
    limit?: number;
}

// Token icon URLs
const TOKEN_ICONS: Record<string, string> = {
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
    'WETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=040',
    'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=040',
    'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040',
    'ARB': 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=040',
};

// Chain icon URLs and names
const CHAIN_CONFIG: Record<number, { name: string; icon: string; color: string }> = {
    1: {
        name: 'Ethereum',
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
        color: 'from-blue-500 to-purple-500',
    },
    8453: {
        name: 'Base',
        icon: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
        color: 'from-blue-500 to-cyan-500',
    },
    42161: {
        name: 'Arbitrum',
        icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=040',
        color: 'from-blue-500 to-pink-500',
    },
    137: {
        name: 'Polygon',
        icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040',
        color: 'from-purple-500 to-pink-500',
    },
};

function getChainConfig(chainId: number) {
    return CHAIN_CONFIG[chainId] || {
        name: `Chain ${chainId}`,
        icon: '',
        color: 'from-gray-400 to-gray-600',
    };
}

function getExplorerUrl(chainId: number, txHash: string): string {
    const explorers: Record<number, string> = {
        1: 'https://etherscan.io/tx/',
        8453: 'https://basescan.org/tx/',
        42161: 'https://arbiscan.io/tx/',
        137: 'https://polygonscan.com/tx/',
    };
    return `${explorers[chainId] || ''}${txHash}`;
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// ✅ FIXED: Proper float value formatting
function formatValue(value: string, decimals: number = 18): string {
    try {
        // Handle empty or invalid values
        if (!value || value === '0' || value === '0x' || value === '0x0') {
            return '0';
        }

        // Convert to BigInt and format with proper decimals
        const formatted = formatUnits(BigInt(value), decimals);
        const num = parseFloat(formatted);

        if (num === 0) return '0';
        if (num < 0.000001) return '< 0.000001';
        if (num < 0.01) return num.toFixed(6); // Show more decimals for tiny amounts
        if (num < 1) return num.toFixed(4);
        if (num < 1000) return num.toFixed(3);
        if (num < 10000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } catch (error) {
        console.error('Error formatting value:', error, value);
        return '0';
    }
}

function TransactionCard({ tx, userAddress }: { tx: BlockchainTransaction; userAddress: string }) {
    const timeAgo = formatTimeAgo(tx.timestamp);
    const isOutgoing = tx.from.toLowerCase() === userAddress.toLowerCase();
    const displayValue = formatValue(tx.value, 18); // Most tokens use 18 decimals
    const chainConfig = getChainConfig(tx.chainId);
    const tokenIcon = TOKEN_ICONS[tx.tokenSymbol || 'ETH'] || TOKEN_ICONS['ETH'];

    return (
        <div className="bg-white border border-silver rounded-lg p-4 hover:border-cyber-yellow/50 transition-all shadow-soft hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                {/* Left side - Transaction info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                        {/* Direction indicator */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOutgoing
                                ? 'bg-red-50 border-2 border-red-200'
                                : 'bg-green-50 border-2 border-green-200'
                            }`}>
                            {isOutgoing ? (
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                            )}
                        </div>

                        {/* Token Icon */}
                        <div className="relative w-10 h-10 rounded-full bg-white border-2 border-silver overflow-hidden">
                            <Image
                                src={tokenIcon}
                                alt={tx.tokenSymbol || 'ETH'}
                                fill
                                className="object-contain p-1"
                                unoptimized
                            />
                        </div>

                        {/* Transaction type and time */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-charcoal">
                                    {isOutgoing ? 'Sent' : 'Received'}
                                </span>
                                <span className="text-xs text-slate">•</span>
                                <span className="text-xs text-slate">{timeAgo}</span>
                            </div>
                            {/* Chain indicator with icon */}
                            <div className="flex items-center gap-2 mt-1">
                                {chainConfig.icon && (
                                    <div className="relative w-4 h-4">
                                        <Image
                                            src={chainConfig.icon}
                                            alt={chainConfig.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <span className="text-xs text-slate">{chainConfig.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount and token */}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-xl font-bold ${isOutgoing ? 'text-red-500' : 'text-green-500'
                            }`}>
                            {isOutgoing ? '-' : '+'}{displayValue}
                        </span>
                        <span className="text-sm font-medium text-slate">
                            {tx.tokenSymbol || 'ETH'}
                        </span>
                    </div>

                    {/* From/To addresses */}
                    <div className="text-xs text-slate space-y-1 bg-light-grey/50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                            <span className="text-slate/70 w-12">From:</span>
                            <span className="font-mono text-charcoal">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate/70 w-12">To:</span>
                            <span className="font-mono text-charcoal">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                        </div>
                    </div>
                </div>

                {/* Right side - Status & Link */}
                <div className="flex flex-col items-end gap-2">
                    {/* Status badge */}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tx.status === 'success'
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {tx.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </span>

                    {/* Explorer link */}
                    <a
                        href={getExplorerUrl(tx.chainId, tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyber-yellow hover:text-cyber-yellow-dark bg-cyber-yellow/10 hover:bg-cyber-yellow/20 rounded-lg transition-all"
                    >
                        <span>View</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

export function RecentActivity({ address, showAll = false, limit = 10 }: RecentActivityProps) {
    const { transactions, isLoading, error, refetch } = useBlockchainHistory();

    const displayedTransactions = showAll ? transactions : transactions.slice(0, limit);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{showAll ? 'All Transactions' : 'Recent Activity'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-cyber-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate">Loading transactions...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{showAll ? 'All Transactions' : 'Recent Activity'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium mb-2">Failed to load transactions</p>
                        <p className="text-sm text-slate mb-4">{error.message}</p>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-cyber-yellow hover:bg-cyber-yellow-dark text-charcoal rounded-lg transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (displayedTransactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{showAll ? 'All Transactions' : 'Recent Activity'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-light-grey border border-silver flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-charcoal font-medium mb-2">No transactions yet</p>
                        <p className="text-sm text-slate">
                            Your transaction history will appear here
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{showAll ? `All Transactions (${transactions.length})` : 'Recent Activity'}</CardTitle>
                <button
                    onClick={refetch}
                    className="p-2 hover:bg-light-grey rounded-lg transition-colors group"
                    title="Refresh"
                >
                    <svg className="w-5 h-5 text-slate group-hover:text-cyber-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedTransactions.map((tx) => (
                        <TransactionCard key={tx.hash} tx={tx} userAddress={address} />
                    ))}
                </div>

                {!showAll && transactions.length > limit && (
                    <div className="mt-6 text-center">
                        <a
                            href="/history"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-yellow/10 hover:bg-cyber-yellow/20 text-cyber-yellow hover:text-cyber-yellow-dark rounded-lg transition-all font-medium"
                        >
                            <span>View all {transactions.length} transactions</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}