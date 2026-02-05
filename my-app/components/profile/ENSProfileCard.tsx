'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ENSProfile } from '@/types/ens';
import { formatAddress, formatChainName } from '@/lib/utils/formatters';

interface ENSProfileCardProps {
    profile: ENSProfile;
    onSend: () => void;
}

export function ENSProfileCard({ profile, onSend }: ENSProfileCardProps) {
    const hasPreferences = profile.preferredChain && profile.preferredToken && profile.depositTarget;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-yellow to-cyber-yellow-dark flex items-center justify-center text-charcoal text-2xl font-bold shadow-soft">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <CardTitle className="text-2xl">{profile.name}</CardTitle>
                        <p className="text-sm text-slate mt-1">
                            {formatAddress(profile.address)}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {hasPreferences ? (
                    <>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Preferred Chain */}
                                <div className="bg-light-grey rounded-lg p-4 border border-silver">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-xs text-slate uppercase">Preferred Chain</span>
                                    </div>
                                    <div className="font-medium text-charcoal">
                                        {profile.preferredChain ? formatChainName(profile.preferredChain) : 'Not set'}
                                    </div>
                                </div>

                                {/* Preferred Token */}
                                <div className="bg-light-grey rounded-lg p-4 border border-silver">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs text-slate uppercase">Preferred Token</span>
                                    </div>
                                    <p className="text-charcoal font-medium">{profile.preferredToken || 'Not set'}</p>
                                </div>

                                {/* Deposit Target */}
                                <div className="bg-light-grey rounded-lg p-4 border border-silver">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-xs text-slate uppercase">Deposit Target</span>
                                    </div>
                                    <p className="text-charcoal font-medium text-sm">
                                        {profile.depositTarget ? formatAddress(profile.depositTarget) : 'Not set'}
                                    </p>
                                </div>
                            </div>

                            {/* Info box */}
                            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 shadow-soft">
                                <p className="text-sm text-charcoal">
                                    <strong>{profile.name}</strong> has configured their Kite profile to receive deposits on{' '}
                                    <strong>{profile.preferredChain ? formatChainName(profile.preferredChain) : 'N/A'}</strong> in{' '}
                                    <strong>{profile.preferredToken || 'N/A'}</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Send button */}
                        <div className="mt-6">
                            <Button
                                onClick={onSend}
                                size="lg"
                                className="w-full"
                            >
                                Send to {profile.name}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-light-grey border border-silver flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-charcoal">
                            {profile.name} hasn&apos;t set up their Kite profile yet.
                        </p>
                        <p className="text-sm text-slate mt-2">
                            They need to configure their preferred chain, token, and deposit target.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}