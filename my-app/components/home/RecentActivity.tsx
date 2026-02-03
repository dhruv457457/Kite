'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { TransactionReceipt } from '@/components/swap/TransactionReceipt';
import useTransactionHistory from '@/hooks/useTransactionHistory';
import { formatDate } from '@/lib/utils/formatters';
import type { Transaction } from '@/types/transaction';

interface RecentActivityProps {
    address: `0x${string}`;
    showAll?: boolean;
}

export function RecentActivity({ address, showAll = false }: RecentActivityProps) {
    const { transactions, getTransactions } = useTransactionHistory();
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const recentTransactions = showAll ? getTransactions() : getTransactions().slice(0, 5);

    const getStatusColor = (status: 'pending' | 'completed' | 'failed') => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'failed':
                return 'bg-red-500/20 text-red-400 border-red-500/50';
        }
    };

    const getStatusLabel = (status: 'pending' | 'completed' | 'failed') => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'pending':
                return 'Pending';
            case 'failed':
                return 'Failed';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-12">
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-lg font-medium text-zinc-400">No transactions yet</p>
                            <p className="text-sm text-zinc-500 mt-2">
                                Send your first deposit to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentTransactions.map((transaction) => (
                                <button
                                    key={transaction.id}
                                    onClick={() => setSelectedTransaction(transaction)}
                                    className="w-full p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-cyan-500 hover:bg-zinc-800 transition-all text-left"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white mb-1">
                                                You sent {transaction.amounts.input}{' '}
                                                {transaction.route.fromToken.symbol} to{' '}
                                                <span className="text-cyan-400">
                                                    {transaction.to.ensName || transaction.to.address}
                                                </span>
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {formatDate(transaction.timestamp)}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium border rounded ${getStatusColor(
                                                    transaction.status
                                                )}`}
                                            >
                                                {getStatusLabel(transaction.status)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Receipt Modal */}
            {selectedTransaction && (
                <Modal
                    isOpen={!!selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    size="lg"
                >
                    <TransactionReceipt
                        transaction={selectedTransaction}
                        onSendAnother={() => setSelectedTransaction(null)}
                        onViewHistory={() => setSelectedTransaction(null)}
                    />
                </Modal>
            )}
        </>
    );
}
