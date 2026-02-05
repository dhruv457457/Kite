'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { SelectedToken } from './TokenSelector';
import type { ENSProfile } from '@/types/ens';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/formatters';
import { isValidAmount, exceedsBalance } from '@/lib/utils/validators';

interface AmountInputProps {
    selectedToken: SelectedToken | null;
    recipientProfile: ENSProfile | null;
    onAmountChange: (amount: string, error?: string) => void;
    amount: string;
    error?: string;
}

export function AmountInput({
    selectedToken,
    recipientProfile,
    onAmountChange,
    amount,
    error,
}: AmountInputProps) {
    const [localError, setLocalError] = useState<string>('');

    // Validate amount whenever it changes
    useEffect(() => {
        if (!amount || !selectedToken) {
            setLocalError('');
            return;
        }

        // Validate format
        if (!isValidAmount(amount)) {
            setLocalError('Invalid amount');
            onAmountChange(amount, 'Invalid amount');
            return;
        }

        // Validate against balance
        const formattedBalance = formatTokenAmount(
            selectedToken.balance,
            selectedToken.decimals,
            18
        );

        if (exceedsBalance(amount, formattedBalance)) {
            setLocalError('Insufficient balance');
            onAmountChange(amount, 'Insufficient balance');
            return;
        }

        // Valid amount
        setLocalError('');
        onAmountChange(amount);
    }, [amount, selectedToken, onAmountChange]);

    const handleMaxClick = () => {
        if (!selectedToken) return;

        const maxAmount = formatTokenAmount(
            selectedToken.balance,
            selectedToken.decimals,
            6
        );

        onAmountChange(maxAmount);
    };

    const formattedBalance = selectedToken
        ? formatTokenAmount(selectedToken.balance, selectedToken.decimals, 4)
        : '0';

    return (
        <div className="space-y-4">
            {/* Amount Input */}
            <div className="bg-white border border-silver rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate">Amount</label>
                    {selectedToken && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMaxClick}
                            className="text-cyber-yellow hover:text-cyber-yellow-dark font-semibold"
                        >
                            Max
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and decimal point
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                onAmountChange(value);
                            }
                        }}
                        disabled={!selectedToken}
                        className="flex-1 bg-transparent text-3xl font-semibold text-charcoal focus:outline-none placeholder-slate/30"
                    />

                    {selectedToken && (
                        <div className="px-4 py-2 bg-light-grey rounded-lg border border-silver">
                            <span className="font-medium text-charcoal">{selectedToken.symbol}</span>
                        </div>
                    )}
                </div>

                {/* Balance Display */}
                {selectedToken && (
                    <div className="mt-3 text-sm text-slate">
                        Balance: {formattedBalance} {selectedToken.symbol}
                        {selectedToken.balanceUSD && (
                            <span className="ml-2">(${selectedToken.balanceUSD})</span>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {(localError || error) && (
                    <div className="mt-3 text-sm text-red-500 font-medium">
                        {localError || error}
                    </div>
                )}
            </div>

            {/* Estimated Output */}
            {selectedToken && recipientProfile && amount && !localError && !error && (
                <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-charcoal">
                                <strong>You send:</strong> {amount} {selectedToken.symbol} on {selectedToken.chainName}
                            </p>
                            <p className="text-sm text-charcoal mt-1">
                                <strong>{recipientProfile.name} receives:</strong> ~{amount}{' '}
                                {recipientProfile.preferredToken || selectedToken.symbol} on{' '}
                                {recipientProfile.preferredChain || selectedToken.chainName}
                            </p>
                            <p className="text-xs text-slate mt-2">
                                Exact amount will be calculated in the next step
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Token Selected State */}
            {!selectedToken && (
                <div className="text-center py-8 text-slate">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-charcoal font-medium">Select a token to continue</p>
                </div>
            )}
        </div>
    );
}
