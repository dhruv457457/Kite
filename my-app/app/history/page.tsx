'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RecentActivity } from '@/components/home/RecentActivity';

export default function HistoryPage() {
    const { address, isConnected } = useAccount();

    // Not connected state
    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-center">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-zinc-400 mb-2">
                                    Connect your wallet to view your transaction history
                                </p>
                                <p className="text-sm text-zinc-500">
                                    All your cross-chain swaps and deposits in one place
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <ConnectButton />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
                    <p className="text-zinc-400">
                        View all your past cross-chain swaps, bridges, and deposits
                    </p>
                </div>

                {/* Transaction History */}
                <RecentActivity address={address!} showAll={true} />

                {/* Info Card */}
                <div className="mt-8">
                    <Card>
                        <CardContent className="py-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-400 font-medium mb-1">
                                        About Transaction History
                                    </p>
                                    <p className="text-sm text-blue-400/80">
                                        Your transaction history is stored locally in your browser. It includes all successful and pending transactions initiated through Kite. You can click on any transaction to view full details including transaction hashes and block explorer links.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
