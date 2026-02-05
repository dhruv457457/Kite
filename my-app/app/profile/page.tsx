'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { PortfolioBalance } from '@/components/home/PortfolioBalance';
import { RecentActivity } from '@/components/home/RecentActivity';
import useENSProfile from '@/hooks/useENSProfile';

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { data: ensName, isLoading: isLoadingEnsName } = useEnsName({
        address,
        chainId: mainnet.id,
    });

    // Fetch user's existing ENS profile
    const { profile, isLoading: isLoadingProfile } = useENSProfile(ensName || '');

    // Not connected state
    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-center">Connect Your Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-zinc-400 mb-2">
                                    Connect your wallet to set up your Kite profile
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Your profile preferences are stored in your ENS text records
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

    // Loading ENS name
    if (isLoadingEnsName) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-zinc-400">Checking for ENS name...</p>
                </div>
            </div>
        );
    }

    // No ENS name found
    if (!ensName) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-center">No ENS Name Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-zinc-300 font-medium mb-2">
                                    You need an ENS name to use Kite Profile features
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Connected address: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                </p>
                            </div>

                            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-left">
                                <p className="text-sm text-zinc-400 mb-3">
                                    <strong className="text-white">What is ENS?</strong>
                                </p>
                                <p className="text-sm text-zinc-500 mb-3">
                                    ENS (Ethereum Name Service) is like DNS for Ethereum. It allows you to have a human-readable name like "vitalik.eth" instead of a long address.
                                </p>
                                <a
                                    href="https://ens.domains"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                                >
                                    Register an ENS name
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Has ENS name - show profile setup
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-charcoal mb-2">My Profile</h1>
                    <p className="text-slate">
                        View your portfolio, activity, and configure your Kite preferences
                    </p>
                </div>

                {/* Portfolio Balance and Recent Activity - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Portfolio Balance */}
                    <div>
                        <PortfolioBalance />
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <RecentActivity address={address!} limit={5} />
                    </div>
                </div>

                {/* Profile Setup Section */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-charcoal mb-2">Kite Configuration</h2>
                    <p className="text-slate">
                        Configure your receiving preferences. This data is stored in your ENS text records.
                    </p>
                </div>

                {/* Profile Setup Component */}
                {isLoadingProfile ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <ProfileSetup
                        ensName={ensName}
                        address={address!}
                        existingProfile={profile}
                    />
                )}
            </div>
        </div>
    );
}
