'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ENSProfileCard } from './ENSProfileCard';
import { useToast } from '@/components/ui/Toast';
import useENSWrite from '@/hooks/useENSWrite';
import { isValidAddress } from '@/lib/utils/validators';
import { getChainNameFromId, getChainIdFromName } from '@/lib/ens/textRecords';
import type { ENSProfile } from '@/types/ens';

interface ProfileSetupProps {
    ensName: string;
    address: `0x${string}`;
    existingProfile: ENSProfile | null;
}

const SUPPORTED_CHAINS = [
    { id: 1, name: 'Ethereum', color: 'from-blue-500 to-purple-500' },
    { id: 8453, name: 'Base', color: 'from-blue-500 to-cyan-500' },
    { id: 42161, name: 'Arbitrum', color: 'from-blue-500 to-pink-500' },
    { id: 137, name: 'Polygon', color: 'from-purple-500 to-pink-500' },
];

export function ProfileSetup({ ensName, address, existingProfile }: ProfileSetupProps) {
    const { showToast } = useToast();
    const { setKiteProfile, isWriting, isSuccess, error, reset } = useENSWrite();

    // Form state
    const [preferredChain, setPreferredChain] = useState<string>('');
    const [preferredToken, setPreferredToken] = useState<string>('');
    const [depositTarget, setDepositTarget] = useState<string>('');

    // Validation state
    const [addressError, setAddressError] = useState<string>('');

    // Initialize form with existing profile data
    useEffect(() => {
        if (existingProfile) {
            setPreferredChain(existingProfile.preferredChain || '');
            setPreferredToken(existingProfile.preferredToken || '');
            setDepositTarget(existingProfile.depositTarget || '');
        }
    }, [existingProfile]);

    // Validate deposit target address
    useEffect(() => {
        if (depositTarget && !isValidAddress(depositTarget)) {
            setAddressError('Invalid Ethereum address');
        } else {
            setAddressError('');
        }
    }, [depositTarget]);

    // Check if form has changes
    const hasChanges = useMemo(() => {
        return (
            preferredChain !== (existingProfile?.preferredChain || '') ||
            preferredToken !== (existingProfile?.preferredToken || '') ||
            depositTarget !== (existingProfile?.depositTarget || '')
        );
    }, [preferredChain, preferredToken, depositTarget, existingProfile]);

    // Check if form is valid
    const isFormValid = useMemo(() => {
        return (
            preferredChain !== '' &&
            preferredToken !== '' &&
            depositTarget !== '' &&
            isValidAddress(depositTarget) &&
            hasChanges
        );
    }, [preferredChain, preferredToken, depositTarget, hasChanges]);

    // Create live preview profile
    const previewProfile: ENSProfile = useMemo(() => ({
        name: ensName,
        address,
        preferredChain,
        preferredToken,
        depositTarget: depositTarget as `0x${string}`,
    }), [ensName, address, preferredChain, preferredToken, depositTarget]);

    // Handle form submission
    const handleSave = async () => {
        if (!isFormValid) return;

        console.log(`Saving Kite profile for ${ensName}...`);

        try {
            showToast('info', 'Waiting for wallet signature...');

            await setKiteProfile(preferredChain, preferredToken, depositTarget);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            showToast('error', errorMessage);
        }
    };

    // Handle transaction pending state
    useEffect(() => {
        if (isWriting) {
            showToast('info', 'Transaction pending...');
        }
    }, [isWriting, showToast]);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            showToast('success', 'Profile updated in one transaction!');
            reset();
        }
    }, [isSuccess, showToast, reset]);

    // Handle error
    useEffect(() => {
        if (error) {
            showToast(error.message, 'error');
        }
    }, [error, showToast]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Configure Your Kite Intent</CardTitle>
                        <p className="text-sm text-zinc-400 mt-2">
                            Set your preferred chain, token, and vault address for receiving deposits
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            {/* Preferred Chain */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Preferred Receiving Chain *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SUPPORTED_CHAINS.map((chain) => (
                                        <button
                                            key={chain.id}
                                            type="button"
                                            onClick={() => setPreferredChain(chain.name.toLowerCase())}
                                            className={`
                        p-4 rounded-lg border-2 transition-all
                        ${preferredChain === chain.name.toLowerCase()
                                                    ? 'border-cyan-500 bg-cyan-500/10'
                                                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${chain.color} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {chain.name.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium text-white">{chain.name}</div>
                                                    {preferredChain === chain.name.toLowerCase() && (
                                                        <div className="text-xs text-cyan-400">Selected</div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Token */}
                            <div>
                                <Input
                                    label="Preferred Receiving Token *"
                                    placeholder="e.g., USDC, ETH, DAI"
                                    value={preferredToken}
                                    onChange={(e) => setPreferredToken(e.target.value.toUpperCase())}
                                    helperText="The token you want to receive on your preferred chain"
                                />
                            </div>

                            {/* Deposit Target (Vault Address) */}
                            <div>
                                <Input
                                    label="Deposit Target (Vault Address) *"
                                    placeholder="0x..."
                                    value={depositTarget}
                                    onChange={(e) => setDepositTarget(e.target.value)}
                                    error={addressError}
                                    helperText="The smart contract address where funds should be deposited (e.g., Aave, Yearn vault)"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-400 font-medium mb-1">
                                            About ENS Text Records
                                        </p>
                                        <p className="text-sm text-blue-400/80">
                                            Your preferences are saved to your ENS name as text records. Anyone can read them, but only you can update them. This makes your profile publicly discoverable.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={!isFormValid || isWriting || !hasChanges}
                                isLoading={isWriting}
                            >
                                {isWriting ? 'Saving to ENS...' : 'Save to ENS'}
                            </Button>

                            {!hasChanges && preferredChain && (
                                <p className="text-sm text-zinc-500 text-center">
                                    No changes detected
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Live Preview */}
            <div>
                <div className="sticky top-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1">Live Preview</h3>
                        <p className="text-sm text-zinc-400">
                            This is how others will see your profile
                        </p>
                    </div>

                    <div className="transition-all duration-300 ease-in-out">
                        <ENSProfileCard
                            profile={previewProfile}
                            onSend={() => { }}
                        />
                    </div>

                    {hasChanges && isFormValid && (
                        <div className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                            <p className="text-sm text-cyan-400">
                                ✨ Preview updated! Click "Save to ENS" to make these changes permanent.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
