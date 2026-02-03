'use client';

import React, { useState } from 'react';
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
import useKiteSafe from '@/hooks/useKiteSafe';
import useTokenBalance from '@/hooks/useTokenBalance';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import type { SelectedToken } from './TokenSelector';

interface SwapFlowProps {
    recipientProfile: ENSProfile;
    onBack: () => void;
}

type FlowStep = 'select' | 'route' | 'confirm' | 'receipt';

export function SwapFlow({ recipientProfile, onBack }: SwapFlowProps) {
    const { address } = useAccount();
    const [currentStep, setCurrentStep] = useState<FlowStep>('select');
    const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<boolean>(false);

    // Fetch user's token balances
    const { balances, isLoading: isLoadingBalances } = useTokenBalance({ address });

    // Prepare recipient chain ID
    const recipientChainId = React.useMemo(() => {
        if (!recipientProfile.preferredChain) return 0;

        const chainMap: Record<string, number> = {
            'ethereum': 1,
            'base': 8453,
            'arbitrum': 42161,
            'polygon': 137
        };

        return chainMap[recipientProfile.preferredChain.toLowerCase()] || 0;
    }, [recipientProfile.preferredChain]);

    // ✅ FIX: Determine the destination token address based on preferred token
    const destinationTokenAddress = React.useMemo(() => {
        // This is a simplified mapping - you should expand this based on actual token addresses per chain
        const tokenAddresses: Record<number, Record<string, `0x${string}`>> = {
            // Base
            8453: {
                'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                'ETH': '0x0000000000000000000000000000000000000000',
                'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
            },
            // Arbitrum
            42161: {
                'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                'ETH': '0x0000000000000000000000000000000000000000',
                'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            },
            // Polygon
            137: {
                'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                'ETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            },
        };

        const preferredToken = recipientProfile.preferredToken?.toUpperCase() || 'USDC';
        return tokenAddresses[recipientChainId]?.[preferredToken] || '0x0000000000000000000000000000000000000000' as `0x${string}`;
    }, [recipientChainId, recipientProfile.preferredToken]);

    // ✅ Generate KiteSafe calldata with recipient parameter
    const { depositCallData, contractAddress } = useKiteSafe({
        chainId: recipientChainId,
        token: destinationTokenAddress, // ✅ Correct token address for destination chain
        vault: recipientProfile.depositTarget || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
        recipient: recipientProfile.address, // ✅ WHO GETS THE VAULT SHARES
        amount: amount && selectedToken ? parseUnits(amount, selectedToken.decimals) : BigInt(0),
    });

    // ✅ CRITICAL FIX: Only use KiteSafe if we have BOTH a valid vault AND a valid KiteSafe contract
    const shouldUseKiteSafe = Boolean(
        recipientProfile.depositTarget &&
        recipientProfile.depositTarget !== '0x0000000000000000000000000000000000000000' &&
        contractAddress &&
        contractAddress !== '0x0000000000000000000000000000000000000000'
    );

    console.log('🔍 Debug - KiteSafe params:', {
        chainId: recipientChainId,
        token: destinationTokenAddress,
        vault: recipientProfile.depositTarget,
        recipient: recipientProfile.address,
        amount: amount && selectedToken ? parseUnits(amount, selectedToken.decimals).toString() : '0',
        contractAddress,
        depositCallData,
        shouldUseKiteSafe,
    });

    // ✅ Fetch route from LI.FI with correct parameters
    const { selectedRoute, isLoading: isLoadingRoute, error: routeError } = useLifiRoute({
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
        fromAmount: amount && selectedToken ? parseUnits(amount, selectedToken.decimals).toString() : '0',
        fromAddress: address || ('0x0000000000000000000000000000000000000000' as `0x${string}`),

        // ✅ toAddress is only used for non-contract-call routes
        toAddress: recipientProfile.address,

        // ✅ CRITICAL FIX: Only set vaultAddress when we have a valid KiteSafe contract
        // If no KiteSafe, leave undefined (regular transfer, no contract call)
        vaultAddress: shouldUseKiteSafe && contractAddress
            ? contractAddress
            : undefined,

        // ✅ The encoded safeDepositFor call (only if we have valid calldata)
        depositCallData: shouldUseKiteSafe && depositCallData && depositCallData !== '0x'
            ? depositCallData
            : undefined,

        enabled: currentStep === 'route' && !!amount && !!selectedToken,
    });

    // Log any route errors
    React.useEffect(() => {
        if (routeError) {
            console.error('❌ Route Error:', routeError);
        }
    }, [routeError]);

    // Execute route
    const { executeRoute, progress, isExecuting, txHashes, error: executeError } = useLifiExecute();

    const handleTokenSelect = (token: SelectedToken) => {
        setSelectedToken(token);
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
    };

    const handleGetRoute = () => {
        if (selectedToken && amount && parseFloat(amount) > 0) {
            setCurrentStep('route');
        }
    };

    const handleConfirm = () => {
        setCurrentStep('confirm');
    };

    const handleExecute = async () => {
        if (!selectedRoute) return;

        try {
            await executeRoute(selectedRoute, {
                onSuccess: () => {
                    setCurrentStep('receipt');
                },
                onError: (error) => {
                    console.error('Execution failed:', error);
                },
            });
        } catch (error) {
            console.error('Failed to execute route:', error);
        }
    };

    const handleStartOver = () => {
        setCurrentStep('select');
        setSelectedToken(null);
        setAmount('');
    };

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
                    <h2 className="text-2xl font-bold text-white">
                        Send to {recipientProfile.name}
                    </h2>
                    <p className="text-sm text-zinc-400">
                        {shouldUseKiteSafe
                            ? `Depositing to ${recipientProfile.preferredToken} vault on ${recipientProfile.preferredChain}`
                            : `Sending ${recipientProfile.preferredToken} on ${recipientProfile.preferredChain}`
                        }
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {['Select Token', 'Get Route', 'Confirm', 'Complete'].map((step, index) => (
                    <React.Fragment key={step}>
                        <div
                            className={`flex items-center gap-2 ${index <= ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                ? 'text-cyan-400'
                                : 'text-zinc-600'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                    ? 'border-cyan-400 bg-cyan-400/10'
                                    : 'border-zinc-600'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">{step}</span>
                        </div>
                        {index < 3 && (
                            <div
                                className={`w-12 h-0.5 ${index < ['select', 'route', 'confirm', 'receipt'].indexOf(currentStep)
                                    ? 'bg-cyan-400'
                                    : 'bg-zinc-600'
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
                        {/* Token Selection Button */}
                        <button
                            onClick={() => setIsTokenSelectorOpen(true)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500 transition-all"
                        >
                            {selectedToken ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                            {selectedToken.symbol.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-white">{selectedToken.symbol}</div>
                                            <div className="text-sm text-zinc-500">{selectedToken.chainName}</div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Select a token</span>
                                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        {/* Token Selector Modal */}
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
                                <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-zinc-400">Finding best route...</p>
                            </CardContent>
                        </Card>
                    ) : routeError ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-red-400 font-medium mb-2">Route Error</p>
                                <p className="text-sm text-zinc-400">{routeError.message}</p>
                                <Button className="mt-4" onClick={() => setCurrentStep('select')}>
                                    Go Back
                                </Button>
                            </CardContent>
                        </Card>
                    ) : selectedRoute ? (
                        <>
                            <RouteDisplay route={selectedRoute} isLoading={false} />
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
                                <p className="text-zinc-400">No route found. Try a different amount.</p>
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