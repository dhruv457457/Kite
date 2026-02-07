'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import useTokenBalance from '@/hooks/useTokenBalance';
import { formatTokenAmount } from '@/lib/utils/formatters';

export interface SelectedToken {
    symbol: string;
    address: string;
    decimals: number;
    balance: string;
    balanceUSD?: string;
    chainId: number;
    chainName: string;
}

interface TokenSelectorInlineProps {
    onSelect: (token: SelectedToken) => void;
    onClose: () => void;
    recipientToken?: string;
}

type FilterMode = 'balance' | 'all';

export function TokenSelectorInline({ onSelect, onClose, recipientToken }: TokenSelectorInlineProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<FilterMode>('balance');
    const [showAll, setShowAll] = useState(false); // ✅ Track if showing all tokens
    const { balances, isLoading, error } = useTokenBalance();

    // ✅ Chain configurations
    const chainConfigs: Record<number, { name: string; gradient: string; logo: string }> = {
        1: { name: 'Ethereum', gradient: 'from-blue-500 to-purple-500', logo: 'E' },
        8453: { name: 'Base', gradient: 'from-blue-500 to-cyan-500', logo: 'B' },
        42161: { name: 'Arbitrum', gradient: 'from-blue-500 to-pink-500', logo: 'A' },
        137: { name: 'Polygon', gradient: 'from-purple-500 to-pink-500', logo: 'P' },
    };

    // Filter tokens
    const filteredBalances = useMemo(() => {
        let filtered = balances;

        if (filterMode === 'balance') {
            filtered = filtered.filter(b => BigInt(b.balance) > BigInt(0));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.token.symbol.toLowerCase().includes(query) ||
                b.chainName.toLowerCase().includes(query)
            );
        }

        // Sort by USD value within each result
        filtered.sort((a, b) => {
            const aUSD = parseFloat(a.balanceUSD || '0');
            const bUSD = parseFloat(b.balanceUSD || '0');
            return bUSD - aUSD;
        });

        return filtered; // ✅ NO .slice() - show all tokens!
    }, [balances, searchQuery, filterMode]);

    // ✅ Group tokens by chain
    const tokensByChain = useMemo(() => {
        const grouped: Record<number, typeof balances> = {};

        // Initialize all chains (even if empty)
        Object.keys(chainConfigs).forEach(chainId => {
            grouped[Number(chainId)] = [];
        });

        // Group filtered tokens
        filteredBalances.forEach((balance) => {
            if (!grouped[balance.chainId]) {
                grouped[balance.chainId] = [];
            }
            grouped[balance.chainId].push(balance);
        });

        // Sort tokens within each chain by USD value
        Object.values(grouped).forEach(chainBalances => {
            chainBalances.sort((a, b) => {
                const aUSD = parseFloat(a.balanceUSD || '0');
                const bUSD = parseFloat(b.balanceUSD || '0');
                return bUSD - aUSD;
            });
        });

        return grouped;
    }, [filteredBalances, chainConfigs]);

    // ✅ Calculate tokens to display (limit 10 initially, or show all)
    const displayLimit = showAll ? Infinity : 10;
    const totalTokens = filteredBalances.length;

    const handleSelect = (balance: typeof balances[0]) => {
        const token: SelectedToken = {
            symbol: balance.token.symbol,
            address: balance.token.address,
            decimals: balance.token.decimals,
            balance: balance.balance,
            balanceUSD: balance.balanceUSD,
            chainId: balance.chainId,
            chainName: balance.chainName,
        };
        onSelect(token);
    };

    return (
        <div className="bg-white border-2 border-cyber-yellow rounded-xl shadow-2xl overflow-hidden animate-slideDown">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyber-yellow/10 to-transparent p-4 border-b border-silver">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-charcoal">Select Token</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-light-grey rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <Input
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                />

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => setFilterMode('balance')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === 'balance'
                                ? 'bg-cyber-yellow text-charcoal'
                                : 'bg-light-grey text-slate hover:bg-silver'
                            }`}
                    >
                        With Balance ({balances.filter(b => BigInt(b.balance) > BigInt(0)).length})
                    </button>
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === 'all'
                                ? 'bg-cyber-yellow text-charcoal'
                                : 'bg-light-grey text-slate hover:bg-silver'
                            }`}
                    >
                        All Tokens ({balances.length})
                    </button>
                </div>
            </div>

            {/* Token List - Grouped by Chain */}
            <div className="max-h-[500px] overflow-y-auto">
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {error && (
                    <div className="p-6 text-center text-red-500 text-sm">
                        Failed to load tokens
                    </div>
                )}

                {!isLoading && !error && filteredBalances.length === 0 && (
                    <div className="p-8 text-center text-slate">
                        <p className="text-sm">No tokens found</p>
                    </div>
                )}

                {/* ✅ Display tokens grouped by chain */}
                {!isLoading && !error && Object.entries(tokensByChain).map(([chainIdStr, chainBalances]) => {
                    const chainId = Number(chainIdStr);
                    const config = chainConfigs[chainId];

                    // Skip empty chains if filtering by balance
                    if (filterMode === 'balance' && chainBalances.length === 0) {
                        return null;
                    }

                    // Apply display limit across all chains
                    let displayedCount = 0;
                    const shouldShowChain = chainBalances.some((_, idx) => {
                        if (displayedCount >= displayLimit) return false;
                        displayedCount++;
                        return true;
                    });

                    if (!shouldShowChain && !showAll) {
                        return null;
                    }

                    return (
                        <div key={chainId} className="mb-2">
                            {/* ✅ Chain Header */}
                            <div className="sticky top-0 bg-light-grey/95 backdrop-blur-sm z-10 px-4 py-2 flex items-center gap-3 border-b border-silver">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                                    {config.logo}
                                </div>
                                <span className="text-sm font-semibold text-charcoal">
                                    {config.name}
                                </span>
                                <div className="flex-1 h-px bg-silver"></div>
                                <span className="text-xs text-slate">
                                    {chainBalances.length} token{chainBalances.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* ✅ Tokens in this chain */}
                            {chainBalances.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-slate">
                                    No tokens on {config.name}
                                </div>
                            ) : (
                                <div>
                                    {chainBalances.slice(0, showAll ? undefined : 5).map((balance) => {
                                        const hasBalance = BigInt(balance.balance) > BigInt(0);
                                        const formattedBalance = formatTokenAmount(balance.balance, balance.token.decimals, 6);
                                        const isRecommended = balance.token.symbol === recipientToken;

                                        return (
                                            <button
                                                key={`${balance.chainId}-${balance.token.address}`}
                                                onClick={() => handleSelect(balance)}
                                                disabled={!hasBalance}
                                                className={`
                                                    w-full px-4 py-3 flex items-center justify-between
                                                    border-b border-silver/50 last:border-b-0
                                                    transition-all
                                                    ${hasBalance
                                                        ? 'hover:bg-cyber-yellow/5 cursor-pointer active:bg-cyber-yellow/10'
                                                        : 'opacity-40 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Token Icon */}
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                                                        {balance.token.symbol.charAt(0)}
                                                    </div>

                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-charcoal">
                                                                {balance.token.symbol}
                                                            </span>
                                                            {isRecommended && (
                                                                <span className="text-xs">⭐</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate">
                                                            {config.name}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Balance */}
                                                <div className="text-right">
                                                    <div className="font-medium text-charcoal text-sm">
                                                        {formattedBalance}
                                                    </div>
                                                    {balance.balanceUSD && parseFloat(balance.balanceUSD) > 0 && (
                                                        <div className="text-xs text-slate">
                                                            ${parseFloat(balance.balanceUSD).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Show more tokens in this chain */}
                                    {!showAll && chainBalances.length > 5 && (
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="w-full px-4 py-2 text-xs text-cyber-yellow hover:text-cyber-yellow-dark font-medium text-center border-b border-silver/50"
                                        >
                                            +{chainBalances.length - 5} more on {config.name}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ✅ Show All / Show Less Toggle */}
                {!isLoading && !error && totalTokens > 10 && (
                    <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-3 text-center border-t border-silver">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-4 py-2 bg-cyber-yellow hover:bg-cyber-yellow-dark text-charcoal text-sm font-medium rounded-lg transition-colors shadow-soft"
                        >
                            {showAll ? (
                                <>
                                    <span>Show Less</span>
                                    <svg className="w-4 h-4 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span>View All {totalTokens} Tokens</span>
                                    <svg className="w-4 h-4 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}