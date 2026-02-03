'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import useTokenBalance from '@/hooks/useTokenBalance';
import { formatTokenAmount } from '@/lib/utils/formatters';
import { getChainNameFromId } from '@/lib/ens/textRecords';

export interface SelectedToken {
    symbol: string;
    address: string;
    decimals: number;
    balance: string;
    balanceUSD?: string;
    chainId: number;
    chainName: string;
}

interface TokenSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (token: SelectedToken) => void;
}

export function TokenSelector({ isOpen, onClose, onSelect }: TokenSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { balances, isLoading, error } = useTokenBalance();

    // Filter balances based on search query
    const filteredBalances = useMemo(() => {
        if (!searchQuery) return balances;

        const query = searchQuery.toLowerCase();
        return balances.filter(
            (balance) =>
                balance.token.symbol.toLowerCase().includes(query) ||
                balance.chainName.toLowerCase().includes(query)
        );
    }, [balances, searchQuery]);

    // Group by chain for better organization
    const balancesByChain = useMemo(() => {
        const grouped: Record<number, typeof balances> = {};

        filteredBalances.forEach((balance) => {
            if (!grouped[balance.chainId]) {
                grouped[balance.chainId] = [];
            }
            grouped[balance.chainId].push(balance);
        });

        return grouped;
    }, [filteredBalances]);

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
        onClose();
        setSearchQuery('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Token" size="md">
            <div className="space-y-4">
                {/* Search Bar */}
                <Input
                    placeholder="Search by token or chain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                />

                {/* Token List */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-400">
                            <p>Failed to load balances</p>
                            <p className="text-sm text-zinc-500 mt-2">{error.message}</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredBalances.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-lg font-medium">No tokens found</p>
                            <p className="text-sm mt-1">
                                {searchQuery ? 'Try a different search' : 'Your wallet has no balance'}
                            </p>
                        </div>
                    )}

                    {!isLoading && !error && Object.entries(balancesByChain).map(([chainId, chainBalances]) => (
                        <div key={chainId}>
                            {/* Chain Header */}
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <div className="text-sm font-medium text-zinc-400">
                                    {getChainNameFromId(Number(chainId))}
                                </div>
                                <div className="flex-1 h-px bg-zinc-800" />
                            </div>

                            {/* Tokens in this chain */}
                            <div className="space-y-1">
                                {chainBalances.map((balance) => {
                                    const hasBalance = BigInt(balance.balance) > BigInt(0);
                                    const formattedBalance = formatTokenAmount(
                                        balance.balance,
                                        balance.token.decimals,
                                        4
                                    );

                                    return (
                                        <button
                                            key={`${balance.chainId}-${balance.token.address}`}
                                            onClick={() => handleSelect(balance)}
                                            className={`
                        w-full p-3 rounded-lg border transition-all
                        ${hasBalance
                                                    ? 'bg-zinc-800/50 border-zinc-700 hover:border-cyan-500 hover:bg-zinc-800'
                                                    : 'bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed'
                                                }
                      `}
                                            disabled={!hasBalance}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {/* Token Icon Placeholder */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                        {balance.token.symbol.charAt(0)}
                                                    </div>

                                                    <div className="text-left">
                                                        <div className="font-medium text-white">
                                                            {balance.token.symbol}
                                                        </div>
                                                        <div className="text-sm text-zinc-500">
                                                            {balance.chainName}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-medium text-white">
                                                        {formattedBalance}
                                                    </div>
                                                    {balance.balanceUSD && (
                                                        <div className="text-sm text-zinc-500">
                                                            ${balance.balanceUSD}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}
