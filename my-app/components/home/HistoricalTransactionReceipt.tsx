'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Transaction } from '@/types/transaction';
import { formatDate, formatUSD } from '@/lib/utils/formatters';

interface HistoricalTransactionReceiptProps {
    transaction: Transaction;
    onSendAnother: () => void;
    onViewHistory: () => void;
}

export function HistoricalTransactionReceipt({
    transaction,
    onSendAnother,
    onViewHistory,
}: HistoricalTransactionReceiptProps) {
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

    const getStatusIcon = () => {
        switch (transaction.status) {
            case 'completed':
                return (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'pending':
                return (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (transaction.status) {
            case 'completed':
                return 'Transaction Successful!';
            case 'pending':
                return 'Transaction Pending';
            case 'failed':
                return 'Transaction Failed';
        }
    };

    const getStatusDescription = () => {
        switch (transaction.status) {
            case 'completed':
                return 'Your deposit was sent successfully';
            case 'pending':
                return 'Your transaction is being processed';
            case 'failed':
                return 'Your transaction failed to complete';
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="text-center mb-4">
                        {getStatusIcon()}
                        <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
                        <p className="text-zinc-400 mt-2">{getStatusDescription()}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        {/* Transaction Summary */}
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 space-y-4">
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">You sent</p>
                                <p className="text-lg font-semibold text-white">
                                    {transaction.amounts.input} {transaction.route.fromToken.symbol}
                                </p>
                                {transaction.amounts.inputUSD && (
                                    <p className="text-sm text-zinc-500">
                                        {formatUSD(transaction.amounts.inputUSD)}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm text-zinc-400 mb-1">
                                    {transaction.to.ensName || transaction.to.address} received
                                </p>
                                <p className="text-lg font-semibold text-white">
                                    {transaction.amounts.output} {transaction.route.toToken.symbol}
                                </p>
                                {transaction.amounts.outputUSD && (
                                    <p className="text-sm text-zinc-500">
                                        {formatUSD(transaction.amounts.outputUSD)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Route Taken */}
                        {transaction.route.steps && transaction.route.steps.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-400 mb-3">Route Taken</h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {transaction.route.steps.map((step, index) => (
                                        <React.Fragment key={index}>
                                            <div className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                                                {step.toolDetails.name}
                                            </div>
                                            {index < transaction.route.steps.length - 1 && (
                                                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transaction Hashes */}
                        {(transaction.txHashes.swap || transaction.txHashes.bridge || transaction.txHashes.deposit) && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-400 mb-3">Transaction Details</h4>
                                <div className="space-y-2">
                                    {transaction.txHashes.swap && (
                                        <a
                                            href={getExplorerUrl(transaction.route.fromChainId, transaction.txHashes.swap)}
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

                                    {transaction.txHashes.bridge && (
                                        <a
                                            href={getExplorerUrl(transaction.route.fromChainId, transaction.txHashes.bridge)}
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

                                    {transaction.txHashes.deposit && (
                                        <a
                                            href={getExplorerUrl(transaction.route.toChainId, transaction.txHashes.deposit)}
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
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-zinc-800">
                            <span className="text-zinc-400">Transaction Date</span>
                            <span className="text-white">{formatDate(transaction.timestamp)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button variant="secondary" onClick={onSendAnother} className="w-full">
                                Send Another
                            </Button>
                            <Button variant="ghost" onClick={onViewHistory} className="w-full">
                                View History
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
