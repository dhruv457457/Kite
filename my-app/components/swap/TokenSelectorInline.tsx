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
    const { balances, isLoading, error } = useTokenBalance();

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

        // Sort by USD value
        filtered.sort((a, b) => {
            const aUSD = parseFloat(a.balanceUSD || '0');
            const bUSD = parseFloat(b.balanceUSD || '0');
            return bUSD - aUSD;
        });

        return filtered.slice(0, 8); // Show max 8 tokens
    }, [balances, searchQuery, filterMode]);

    // Chain colors
    const chainGradients: Record<number, string> = {
        1: 'from-blue-500 to-purple-500',
        8453: 'from-blue-500 to-cyan-500',
        42161: 'from-blue-500 to-pink-500',
        137: 'from-purple-500 to-pink-500',
    };

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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filterMode === 'balance'
                                ? 'bg-cyber-yellow text-charcoal'
                                : 'bg-light-grey text-slate hover:bg-silver'
                        }`}
                    >
                        With Balance
                    </button>
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filterMode === 'all'
                                ? 'bg-cyber-yellow text-charcoal'
                                : 'bg-light-grey text-slate hover:bg-silver'
                        }`}
                    >
                        All Tokens
                    </button>
                </div>
            </div>

            {/* Token List */}
            <div className="max-h-[400px] overflow-y-auto">
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

                {!isLoading && !error && filteredBalances.map((balance) => {
                    const hasBalance = BigInt(balance.balance) > BigInt(0);
                    const formattedBalance = formatTokenAmount(balance.balance, balance.token.decimals, 6);
                    const isRecommended = balance.token.symbol === recipientToken;
                    const gradient = chainGradients[balance.chainId] || 'from-gray-400 to-gray-600';

                    return (
                        <button
                            key={`${balance.chainId}-${balance.token.address}`}
                            onClick={() => handleSelect(balance)}
                            disabled={!hasBalance}
                            className={`
                                w-full p-4 flex items-center justify-between
                                border-b border-silver last:border-b-0
                                transition-all
                                ${hasBalance
                                    ? 'hover:bg-cyber-yellow/5 cursor-pointer'
                                    : 'opacity-40 cursor-not-allowed'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Token Icon */}
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                                    {balance.token.symbol.charAt(0)}
                                </div>

                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-charcoal">
                                            {balance.token.symbol}
                                        </span>
                                        {isRecommended && (
                                            <span className="text-xs text-cyber-yellow">⭐</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate">
                                        {balance.chainName}
                                    </div>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="text-right">
                                <div className="font-medium text-charcoal text-sm">
                                    {formattedBalance}
                                </div>
                                {balance.balanceUSD && (
                                    <div className="text-xs text-slate">
                                        ${parseFloat(balance.balanceUSD).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}

                {/* Show More Link */}
                {filteredBalances.length === 8 && (
                    <div className="p-3 text-center border-t border-silver bg-light-grey">
                        <button className="text-sm text-cyber-yellow hover:text-cyber-yellow-dark font-medium">
                            View All Tokens →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}