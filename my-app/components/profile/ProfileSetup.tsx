'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ENSProfileCard } from './ENSProfileCard';
import { useToast } from '@/components/ui/Toast';
import useENSWrite from '@/hooks/useENSWrite';
import { isValidAddress } from '@/lib/utils/validators';
import type { ENSProfile } from '@/types/ens';

interface ProfileSetupProps {
    ensName: string;
    address: `0x${string}`;
    existingProfile: ENSProfile | null;
}

const SUPPORTED_CHAINS = [
    {
        id: 1,
        name: 'Ethereum',
        color: 'from-blue-500 to-purple-500',
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040'
    },
    {
        id: 8453,
        name: 'Base',
        color: 'from-blue-500 to-cyan-500',
        icon: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4'
    },
    {
        id: 42161,
        name: 'Arbitrum',
        color: 'from-blue-500 to-pink-500',
        icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=040'
    },
    {
        id: 137,
        name: 'Polygon',
        color: 'from-purple-500 to-pink-500',
        icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040'
    },
];

// Vault recommendations with logos
const VAULT_RECOMMENDATIONS = [
    {
        name: 'Spark USDC Vault',
        address: '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A',
        chain: 'Base',
        apy: '4.2%',
        logo: 'https://pbs.twimg.com/profile_images/1643941027898613760/gyhYEOCE_400x400.jpg',
    },
    {
        name: 'Aave USDC',
        address: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c',
        chain: 'Base',
        apy: '3.8%',
        logo: 'https://cryptologos.cc/logos/aave-aave-logo.png?v=040',
    },
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
        const basicValid = preferredChain !== '' && preferredToken !== '';
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

            const finalDepositTarget = depositTarget && depositTarget.trim() !== ''
                ? depositTarget
                : address;

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
            showToast('error', error.message);
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
                                                <div className="relative w-10 h-10 rounded-full bg-white border-2 border-silver overflow-hidden flex items-center justify-center">
                                                    <Image
                                                        src={chain.icon}
                                                        alt={chain.name}
                                                        width={28}
                                                        height={28}
                                                        className="object-contain"
                                                        unoptimized
                                                    />
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
                                    className="flex items-center gap-2 text-sm text-slate hover:text-charcoal transition-colors"
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
                            {advancedMode && (
                                <div className="bg-light-grey border border-silver rounded-lg p-4 space-y-4">
                                    <Input
                                        label="Vault Contract Address (Optional)"
                                        placeholder="Leave blank to receive in wallet"
                                        value={depositTarget}
                                        onChange={(e) => setDepositTarget(e.target.value)}
                                        error={addressError}
                                        helperText="Auto-deposit incoming funds to a DeFi vault"
                                    />

                                    {/* Vault Recommendations - only show when empty */}
                                    {!depositTarget && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-slate font-medium">Recommended Vaults:</p>
                                            <div className="space-y-2">
                                                {VAULT_RECOMMENDATIONS.map((vault) => (
                                                    <button
                                                        key={vault.address}
                                                        type="button"
                                                        onClick={() => setDepositTarget(vault.address)}
                                                        className="w-full flex items-center gap-3 p-3 bg-white border border-silver rounded-lg hover:border-cyber-yellow/50 transition-all text-left"
                                                    >
                                                        <div className="relative w-8 h-8 rounded-full bg-white border border-silver overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={vault.logo}
                                                                alt={vault.name}
                                                                fill
                                                                className="object-contain p-1"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-charcoal">{vault.name}</span>
                                                                <span className="text-xs text-green-600 font-semibold">{vault.apy} APY</span>
                                                            </div>
                                                            <div className="text-xs text-slate">
                                                                {vault.chain} • {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                                                            </div>
                                                        </div>
                                                        <svg className="w-4 h-4 text-cyber-yellow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Success message - only shows when vault is set */}
                                    {depositTarget && !addressError && depositTarget !== address && (
                                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="font-medium">Vault configured - incoming funds will auto-deposit</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ENS Info */}
                            <div className="text-xs text-slate bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-blue-900">Saved to ENS Text Records</p>
                                        <p className="text-blue-700 mt-1">
                                            Your preferences are stored in your{' '}
                                            <a
                                                href={`https://app.ens.domains/${ensName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline font-medium"
                                            >
                                                ENS profile
                                            </a>
                                            {' '}(public, but only you can update)
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