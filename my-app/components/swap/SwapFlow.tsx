'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { ENSProfile } from '@/types/ens';
import { AmountInput } from './AmountInput';
import { TokenSelector } from './TokenSelector';
import { RouteDisplay } from './RouteDisplay';
import { ConfirmTransaction } from './ConfirmTransaction';
import { TransactionReceipt } from './TransactionReceipt';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import useLifiRoute from '@/hooks/useLifiRoute';
import useLifiExecute from '@/hooks/useLifiExecute';
import useTokenBalance from '@/hooks/useTokenBalance';
import { useAccount } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import type { SelectedToken } from './TokenSelector';

interface SwapFlowProps {
    recipientProfile: ENSProfile;
    onBack: () => void;
}

type FlowStep = 'select' | 'route' | 'confirm' | 'receipt';

// ✅ Vault addresses
const VAULT_ADDRESSES: Record<number, `0x${string}`> = {
    8453: '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // Spark USDC Vault on Base
};



export function SwapFlow({ recipientProfile, onBack }: SwapFlowProps) {
    const { address } = useAccount();
    const [currentStep, setCurrentStep] = useState<FlowStep>('select');
    const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<boolean>(false);

    // Fetch user's token balances
    const { balances, isLoading: isLoadingBalances } = useTokenBalance({ address });

    // Memoize recipient chain ID
    const recipientChainId = useMemo(() => {
        if (!recipientProfile.preferredChain) return 0;

        const chainMap: Record<string, number> = {
            'ethereum': 1,
            'base': 8453,
            'arbitrum': 42161,
            'polygon': 137
        };

        return chainMap[recipientProfile.preferredChain.toLowerCase()] || 0;
    }, [recipientProfile.preferredChain]);

    // Memoize destination token address
    const destinationTokenAddress = useMemo(() => {
        const tokenAddresses: Record<number, Record<string, `0x${string}`>> = {
            8453: {
                'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                'ETH': '0x0000000000000000000000000000000000000000',
                'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
            },
            42161: {
                'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                'ETH': '0x0000000000000000000000000000000000000000',
                'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            },
            137: {
                'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                'ETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            },
        };

        const preferredToken = recipientProfile.preferredToken?.toUpperCase() || 'USDC';
        return tokenAddresses[recipientChainId]?.[preferredToken] || '0x0000000000000000000000000000000000000000' as `0x${string}`;
    }, [recipientChainId, recipientProfile.preferredToken]);

    // Memoize parsed amount
    const parsedAmount = useMemo(() => {
        if (!amount || !selectedToken) return BigInt(0);
        try {
            return parseUnits(amount, selectedToken.decimals);
        } catch {
            return BigInt(0);
        }
    }, [amount, selectedToken]);

    // Check if deposit target is a supported vault
    const isVaultDeposit = useMemo(() => {
        if (!recipientProfile.depositTarget ||
            recipientProfile.depositTarget === '0x0000000000000000000000000000000000000000') {
            return false;
        }

        const supportedVaultAddress = VAULT_ADDRESSES[recipientChainId];

        return Boolean(
            supportedVaultAddress &&
            recipientProfile.depositTarget.toLowerCase() === supportedVaultAddress.toLowerCase()
        );
    }, [recipientProfile.depositTarget, recipientChainId]);



    // Memoize route request params
    const routeParams = useMemo(() => {
        const params = {
            fromToken: selectedToken || {
                address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                chainId: 1,
                symbol: 'ETH',
                decimals: 18,
            },
            toToken: {
                address: destinationTokenAddress,
                chainId: recipientChainId,
                symbol: recipientProfile.preferredToken || 'ETH',
                decimals: 18,
            },
            fromAmount: parsedAmount.toString(),
            fromAddress: address || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
            toAddress: recipientProfile.address,
            vaultAddress: isVaultDeposit ? recipientProfile.depositTarget : undefined, // ✅ Just pass vault address
            enabled: currentStep === 'route' && !!amount && !!selectedToken && parsedAmount > BigInt(0),
        };

        if (params.enabled) {
            console.log('📊 Route Request Params:', {
                fromChain: params.fromToken.chainId,
                toChain: params.toToken.chainId,
                fromToken: params.fromToken.symbol,
                toToken: params.toToken.symbol,
                amount: params.fromAmount,
                hasVault: !!params.vaultAddress,
                vaultAddress: params.vaultAddress,
                willDepositToVault: isVaultDeposit,
            });
        }

        return params;
    }, [
        selectedToken,
        destinationTokenAddress,
        recipientChainId,
        recipientProfile,
        parsedAmount,
        address,
        isVaultDeposit,
        currentStep,
        amount
    ]);

    // Fetch route from LI.FI
    const { selectedRoute, isLoading: isLoadingRoute, error: routeError } = useLifiRoute(routeParams);

    // Log when route is fetched
    useMemo(() => {
        if (selectedRoute) {
            console.log('✅ Route received:', {
                id: selectedRoute.id,
                steps: selectedRoute.steps?.length || 0,
                willDepositToVault: isVaultDeposit,
            });
        }
    }, [selectedRoute, isVaultDeposit]);

    // Execute route
    const { executeRoute, progress, isExecuting, txHashes, error: executeError } = useLifiExecute();

    // Handlers
    const handleTokenSelect = useCallback((token: SelectedToken) => {
        console.log('🪙 Token selected:', token.symbol, 'on', token.chainName);
        setSelectedToken(token);
    }, []);

    const handleAmountChange = useCallback((value: string) => {
        setAmount(value);
    }, []);

    const handleGetRoute = useCallback(() => {
        if (selectedToken && amount && parseFloat(amount) > 0) {
            console.log('🔄 Getting route for', amount, selectedToken.symbol);
            setCurrentStep('route');
        }
    }, [selectedToken, amount]);

    const handleConfirm = useCallback(() => {
        console.log('✔️ Confirming transaction');
        setCurrentStep('confirm');
    }, []);

    const handleExecute = useCallback(async () => {
        if (!selectedRoute) return;

        console.log('🚀 Executing route:', selectedRoute.id);

        try {
            await executeRoute(selectedRoute, {
                onSuccess: () => {
                    console.log('✅ Execution successful!');
                    setCurrentStep('receipt');
                },
                onError: (error) => {
                    console.error('❌ Execution failed:', error);
                },
            });
        } catch (error) {
            console.error('❌ Failed to execute route:', error);
        }
    }, [selectedRoute, executeRoute]);

    const handleStartOver = useCallback(() => {
        console.log('🔄 Starting over');
        setCurrentStep('select');
        setSelectedToken(null);
        setAmount('');
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={onBack}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-charcoal">
                        Send to {recipientProfile.name}
                    </h2>
                    <p className="text-sm text-slate">
                        {isVaultDeposit
                            ? `✅ Will deposit to Spark ${recipientProfile.preferredToken} vault on ${recipientProfile.preferredChain}`
                            : `Sending ${recipientProfile.preferredToken} on ${recipientProfile.preferredChain}`
                        }
                    </p>
                </div>
            </div>

            {/* Vault Deposit Active Banner */}
            {isVaultDeposit && (
                <Card className="bg-green-50 border-green-300">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Vault Deposit Active:</span>
                            <span className="text-xs">Swap → Bridge → Vault Deposit in one transaction</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {['Select Token', 'Get Route', 'Confirm', 'Complete'].map((step, index) => (
                    <React.Fragment key={step}>
                        <div
                            className={`flex items-center gap-2 ${index <= ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                ? 'text-cyber-yellow'
                                : 'text-slate/50'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold ${index <= ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                    ? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow'
                                    : 'border-silver text-slate'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">{step}</span>
                        </div>
                        {index < 3 && (
                            <div
                                className={`w-12 h-0.5 ${index < ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                    ? 'bg-cyber-yellow'
                                    : 'bg-silver'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            {currentStep === 'select' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Token & Amount</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <button
                            onClick={() => setIsTokenSelectorOpen(true)}
                            className="w-full p-4 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft"
                        >
                            {selectedToken ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-yellow to-cyber-yellow-dark flex items-center justify-center text-charcoal font-bold shadow-soft">
                                            {selectedToken.symbol.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-charcoal">{selectedToken.symbol}</div>
                                            <div className="text-sm text-slate">{selectedToken.chainName}</div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate">Select a token</span>
                                    <svg className="w-5 h-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        <TokenSelector
                            isOpen={isTokenSelectorOpen}
                            onClose={() => setIsTokenSelectorOpen(false)}
                            onSelect={handleTokenSelect}
                        />

                        {selectedToken && (
                            <AmountInput
                                selectedToken={selectedToken}
                                recipientProfile={recipientProfile}
                                amount={amount}
                                onAmountChange={handleAmountChange}
                            />
                        )}

                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!selectedToken || !amount || parseFloat(amount) <= 0}
                            onClick={handleGetRoute}
                        >
                            Get Route
                        </Button>
                    </CardContent>
                </Card>
            )}

            {currentStep === 'route' && (
                <div className="space-y-6">
                    {isLoadingRoute ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-cyber-yellow border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate">Finding best route...</p>
                            </CardContent>
                        </Card>
                    ) : routeError ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-red-500 font-medium mb-2">Route Error</p>
                                <p className="text-sm text-slate">{routeError.message}</p>
                                <Button className="mt-4" onClick={() => setCurrentStep('select')}>
                                    Go Back
                                </Button>
                            </CardContent>
                        </Card>
                    ) : selectedRoute ? (
                        <>
                            <RouteDisplay route={selectedRoute} isLoading={false} />

                            {/* Vault deposit info if active */}
                            {isVaultDeposit && (
                                <Card className="bg-blue-50 border-blue-300">
                                    <CardContent className="py-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-blue-900">🎯 Vault Deposit Workflow</p>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        This transaction will: swap your tokens → bridge to {recipientProfile.preferredChain} → deposit into Spark vault.
                                                        Recipient receives vault shares (interest-bearing) in one transaction!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={() => setCurrentStep('select')}>
                                    Change Amount
                                </Button>
                                <Button size="lg" className="flex-1" onClick={handleConfirm}>
                                    Continue to Confirm
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-slate">No route found. Try a different amount.</p>
                                <Button className="mt-4" onClick={() => setCurrentStep('select')}>
                                    Go Back
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {currentStep === 'confirm' && selectedRoute && (
                <div className="space-y-6">
                    <ConfirmTransaction
                        route={selectedRoute}
                        recipientProfile={recipientProfile}
                        onExecute={handleExecute}
                        onCancel={() => setCurrentStep('route')}
                        isExecuting={isExecuting}
                        progress={progress}
                        error={executeError}
                    />
                </div>
            )}

            {currentStep === 'receipt' && selectedRoute && (
                <TransactionReceipt
                    route={selectedRoute}
                    recipientProfile={recipientProfile}
                    txHashes={txHashes}
                    onStartOver={handleStartOver}
                />
            )}
        </div>
    );
}