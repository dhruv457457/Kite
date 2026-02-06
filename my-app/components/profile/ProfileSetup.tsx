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
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);

    // Validation state
    const [addressError, setAddressError] = useState<string>('');

    // Initialize form with existing profile data
    useEffect(() => {
        if (existingProfile) {
            setPreferredChain(existingProfile.preferredChain || '');
            setPreferredToken(existingProfile.preferredToken || '');
            setDepositTarget(existingProfile.depositTarget || '');

            // Show advanced mode if vault is configured
            if (existingProfile.depositTarget &&
                existingProfile.depositTarget !== '0x0000000000000000000000000000000000000000') {
                setAdvancedMode(true);
            }
        }
    }, [existingProfile]);

    // Validate deposit target address (only if provided)
    useEffect(() => {
        if (depositTarget && depositTarget.trim() !== '') {
            if (!isValidAddress(depositTarget)) {
                setAddressError('Invalid Ethereum address');
            } else {
                setAddressError('');
            }
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
        // Basic validation: chain and token are required
        const basicValid = preferredChain !== '' && preferredToken !== '';

        // If deposit target is provided, it must be valid
        const depositValid = depositTarget === '' ||
            depositTarget === '0x0000000000000000000000000000000000000000' ||
            isValidAddress(depositTarget);

        return basicValid && depositValid && hasChanges;
    }, [preferredChain, preferredToken, depositTarget, hasChanges]);

    // Create live preview profile
    const previewProfile: ENSProfile = useMemo(() => ({
        name: ensName,
        address,
        preferredChain,
        preferredToken,
        depositTarget: (depositTarget && depositTarget !== ''
            ? depositTarget as `0x${string}`
            : undefined),
    }), [ensName, address, preferredChain, preferredToken, depositTarget]);

    // Handle form submission
    const handleSave = async () => {
        if (!isFormValid) return;

        console.log(`Saving Kite profile for ${ensName}...`);

        try {
            showToast('info', 'Waiting for wallet signature...');

            // ✅ Use wallet address as default if no vault specified
            const finalDepositTarget = depositTarget && depositTarget.trim() !== ''
                ? depositTarget
                : address; // Use user's wallet as fallback

            await setKiteProfile(preferredChain, preferredToken, finalDepositTarget);

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
            showToast('success', 'Profile updated successfully!');
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
                        <CardTitle>Configure Your Receiving Preferences</CardTitle>
                        <p className="text-sm text-slate mt-2">
                            Tell others how you want to receive funds
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            {/* Preferred Chain */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-charcoal">
                                    Preferred Receiving Chain *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SUPPORTED_CHAINS.map((chain) => (
                                        <button
                                            key={chain.id}
                                            type="button"
                                            onClick={() => setPreferredChain(chain.name.toLowerCase())}
                                            className={`
                        p-4 rounded-lg border-2 transition-all shadow-soft
                        ${preferredChain === chain.name.toLowerCase()
                                                    ? 'border-cyber-yellow bg-cyber-yellow/10'
                                                    : 'border-silver bg-white hover:border-cyber-yellow/50'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${chain.color} flex items-center justify-center text-white font-bold text-sm shadow-soft`}>
                                                    {chain.name.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium text-charcoal">{chain.name}</div>
                                                    {preferredChain === chain.name.toLowerCase() && (
                                                        <div className="text-xs text-cyber-yellow font-semibold">Selected</div>
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

                            {/* Advanced Mode Toggle */}
                            <div className="border-t border-silver pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAdvancedMode(!advancedMode)}
                                    className="flex items-center gap-2 text-sm text-slate hover:text-charcoal"
                                >
                                    <svg
                                        className={`w-4 h-4 transition-transform ${advancedMode ? 'rotate-90' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="font-medium">Advanced: Auto-Deposit to Vault</span>
                                </button>
                            </div>

                            {/* Advanced Section - Vault Deposit */}
                  {/* Advanced Section - Vault Deposit */}
{advancedMode && (
    <div className="bg-light-grey border border-silver rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate">
                <p className="font-medium text-charcoal mb-1">Optional: Vault Auto-Deposit</p>
                <p>If you have a DeFi vault, you can have incoming funds automatically deposited. Otherwise, leave blank to receive tokens directly in your wallet.</p>
            </div>
        </div>

        <Input
            label="Vault Contract Address (Optional)"
            placeholder="0x... or leave blank"
            value={depositTarget}
            onChange={(e) => setDepositTarget(e.target.value)}
            error={addressError}
            helperText="Leave blank to receive tokens in your wallet"
        />

        {/* ✅ Add helpful recommendation */}
        <div className="bg-blue-50 border border-blue-300 rounded p-3 text-xs">
            <p className="font-medium text-blue-900 mb-1">💡 Recommended Vault (Base):</p>
            <p className="text-blue-700 mb-2">Spark USDC Vault - Earn yield automatically</p>
            <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-2 py-1 rounded font-mono text-xs text-charcoal break-all">
                    0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A
                </code>
                <button
                    type="button"
                    onClick={() => setDepositTarget('0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A')}
                    className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                    Use This
                </button>
            </div>
            <p className="text-blue-600 text-xs mt-2">
                <a href="https://app.spark.fi/" target="_blank" rel="noopener noreferrer" className="underline">
                    Learn more about Spark →
                </a>
            </p>
        </div>

        {depositTarget && !addressError && depositTarget !== address && (
            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded p-2 text-xs text-charcoal">
                ✓ Vault configured - incoming funds will be auto-deposited
            </div>
        )}
    </div>
)}

                            {/* Info Box */}
                            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 shadow-soft">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm text-charcoal font-medium mb-1">
                                            About ENS Text Records
                                        </p>
                                        <p className="text-sm text-slate">
                                            Your preferences are saved to your ENS name as public text records. Anyone can read them, but only you can update them.
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
                                {isWriting ? 'Saving to ENS...' : 'Save Preferences'}
                            </Button>

                            {!hasChanges && preferredChain && (
                                <p className="text-sm text-slate text-center">
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
                        <h3 className="text-lg font-semibold text-charcoal mb-1">Live Preview</h3>
                        <p className="text-sm text-slate">
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
                        <div className="mt-4 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-3 shadow-soft">
                            <p className="text-sm text-charcoal">
                                ✨ Preview updated! Click "Save Preferences" to make these changes permanent.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}