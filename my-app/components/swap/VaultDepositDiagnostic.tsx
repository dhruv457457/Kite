'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DiagnosticPanelProps {
    recipientProfile: any;
    contractAddress: `0x${string}` | undefined;
    depositCallData: `0x${string}` | undefined;
    shouldUseKiteSafe: boolean;
    selectedRoute: any;
    parsedAmount: bigint;
}

export function VaultDepositDiagnostic({
    recipientProfile,
    contractAddress,
    depositCallData,
    shouldUseKiteSafe,
    selectedRoute,
    parsedAmount,
}: DiagnosticPanelProps) {
    // Check if route includes contract calls
    const hasContractCallInRoute = selectedRoute?.steps?.some((step: any) =>
        step.includedSteps?.length > 0 ||
        step.type === 'custom' ||
        step.type === 'contract'
    );

    const getStatusIcon = (condition: boolean) => {
        return condition ? (
            <span className="text-green-600">✅</span>
        ) : (
            <span className="text-red-600">❌</span>
        );
    };

    return (
        <Card className="border-2 border-purple-300 bg-purple-50">
            <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Vault Deposit Diagnostics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Status */}
                <div className={`p-3 rounded-lg border-2 ${shouldUseKiteSafe
                    ? 'bg-green-100 border-green-400'
                    : 'bg-red-100 border-red-400'
                    }`}>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(shouldUseKiteSafe)}
                        <span className={`font-bold ${shouldUseKiteSafe ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {shouldUseKiteSafe
                                ? 'Vault Deposit ACTIVE'
                                : 'Vault Deposit INACTIVE - Will send to wallet only'
                            }
                        </span>
                    </div>
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-purple-900 text-sm">Requirements:</h3>

                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-start gap-2">
                            {getStatusIcon(Boolean(recipientProfile.depositTarget && recipientProfile.depositTarget !== '0x0000000000000000000000000000000000000000'))}
                            <div className="flex-1">
                                <span className="font-medium">Deposit Target Set</span>
                                <div className="font-mono text-xs text-gray-600 break-all mt-0.5">
                                    {recipientProfile.depositTarget || 'Not configured'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            {getStatusIcon(Boolean(contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'))}
                            <div className="flex-1">
                                <span className="font-medium">KiteSafe Contract Available</span>
                                <div className="font-mono text-xs text-gray-600 break-all mt-0.5">
                                    {contractAddress || 'Not generated'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            {getStatusIcon(Boolean(depositCallData && depositCallData !== '0x'))}
                            <div className="flex-1">
                                <span className="font-medium">Deposit CallData Generated</span>
                                <div className="font-mono text-xs text-gray-600 break-all mt-0.5">
                                    {depositCallData && depositCallData !== '0x'
                                        ? `${depositCallData.slice(0, 20)}...${depositCallData.slice(-10)} (${depositCallData.length} chars)`
                                        : 'Not generated'
                                    }
                                </div>
                            </div>
                        </div>

                        {selectedRoute && (
                            <div className="flex items-start gap-2">
                                {getStatusIcon(hasContractCallInRoute)}
                                <div className="flex-1">
                                    <span className="font-medium">Route Includes Contract Call</span>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                        {hasContractCallInRoute
                                            ? 'Yes - vault deposit will execute'
                                            : 'No - only transfer will occur'
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Route Details */}
                {selectedRoute && (
                    <div className="space-y-2 pt-2 border-t border-purple-200">
                        <h3 className="font-semibold text-purple-900 text-sm">Route Details:</h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Route ID:</span>
                                <span className="font-mono">{selectedRoute.id?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Steps:</span>
                                <span className="font-medium">{selectedRoute.steps?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-mono">{parsedAmount.toString()}</span>
                            </div>
                        </div>

                        {/* Step Breakdown */}
                        <div className="mt-2">
                            <h4 className="font-medium text-purple-800 text-xs mb-1">Steps:</h4>
                            {selectedRoute.steps?.map((step: any, i: number) => (
                                <div key={i} className="ml-2 text-xs text-gray-700 flex items-start gap-1">
                                    <span className="font-mono text-purple-600">{i + 1}.</span>
                                    <div className="flex-1">
                                        <span className="font-medium">{step.type || 'unknown'}</span>
                                        {' - '}
                                        <span className="text-gray-600">{step.toolDetails?.name || 'unnamed'}</span>
                                        {step.includedSteps && step.includedSteps.length > 0 && (
                                            <span className="ml-1 text-green-600 font-medium">
                                                (+ {step.includedSteps.length} contract calls)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expected Flow */}
                <div className="space-y-2 pt-2 border-t border-purple-200">
                    <h3 className="font-semibold text-purple-900 text-sm">Expected Transaction Flow:</h3>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-start gap-2">
                            <span className="text-purple-600">1.</span>
                            <span>Swap {recipientProfile.preferredToken} (if needed)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-purple-600">2.</span>
                            <span>Bridge to {recipientProfile.preferredChain}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-purple-600">3.</span>
                            <span>Tokens arrive at {recipientProfile.name}'s wallet</span>
                        </div>
                        {shouldUseKiteSafe ? (
                            <>
                                <div className="flex items-start gap-2 text-green-700 font-medium">
                                    <span className="text-green-600">4.</span>
                                    <span>✅ Deposit into Aave vault via contract call</span>
                                </div>
                                <div className="flex items-start gap-2 text-green-700 font-medium">
                                    <span className="text-green-600">5.</span>
                                    <span>✅ Recipient receives aUSDC (interest-bearing)</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-start gap-2 text-red-700 font-medium">
                                <span className="text-red-600">4.</span>
                                <span>❌ Tokens stay in wallet (no vault deposit)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Troubleshooting */}
                {!shouldUseKiteSafe && (
                    <div className="p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 text-sm mb-2">⚠️ Troubleshooting:</h3>
                        <ul className="space-y-1 text-xs text-yellow-800">
                            {!recipientProfile.depositTarget && (
                                <li>• Set vault address in Kite Configuration</li>
                            )}
                            {recipientProfile.depositTarget === '0x0000000000000000000000000000000000000000' && (
                                <li>• Vault address is zero - check configuration</li>
                            )}
                            {!contractAddress && (
                                <li>• KiteSafe contract not available for this chain</li>
                            )}
                            {!depositCallData && (
                                <li>• Deposit calldata generation failed</li>
                            )}
                            <li>• Check browser console for detailed logs</li>
                        </ul>
                    </div>
                )}

                {/* Success Info */}
                {shouldUseKiteSafe && (
                    <div className="p-3 bg-green-100 border border-green-400 rounded-lg">
                        <h3 className="font-semibold text-green-900 text-sm mb-2">✅ Ready to Deposit!</h3>
                        <p className="text-xs text-green-800">
                            Transaction will automatically deposit funds into the Aave vault.
                            The recipient will receive aUSDC tokens representing their deposit,
                            which earn interest over time.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}