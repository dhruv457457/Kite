import { useMemo } from 'react';
import { encodeFunctionData } from 'viem';

interface UseKiteSafeParams {
    chainId: number;
    token: `0x${string}`;
    vault: `0x${string}`;
    recipient: `0x${string}`; // ✅ Who receives the vault shares
    amount: bigint;
}

interface UseKiteSafeResult {
    depositCallData: `0x${string}` | null;
    contractAddress: `0x${string}` | null;
}

/**
 * KiteSafe Contract Addresses by Chain ID
 * ✅ Defined inline to avoid import issues
 */
const KITE_SAFE_ADDRESSES: Record<number, `0x${string}`> = {
    // Base Mainnet
    8453: '0x97cFF7a2B8321c8B60c173FcB2a50459F879b759',
    // Arbitrum One
    42161: '0xbe5064fa89f7533def973EaF00BAc0BD87fcA40f',
};

/**
 * KiteSafe ABI with the safeDepositFor function
 */
const KITE_SAFE_ABI = [
    {
        "inputs": [
            { "name": "_token", "type": "address" },
            { "name": "_vault", "type": "address" },
            { "name": "_recipient", "type": "address" },
            { "name": "_amount", "type": "uint256" },
            { "name": "_data", "type": "bytes" }
        ],
        "name": "safeDepositFor",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

/**
 * Hook to generate KiteSafe deposit calldata for LI.FI Composer
 * 
 * ✅ Uses safeDepositFor to support "send to recipient" flows
 * 
 * @param chainId - Destination chain ID
 * @param token - Token address being deposited
 * @param vault - Vault contract address
 * @param recipient - Who should receive the vault shares
 * @param amount - Amount to deposit (in wei)
 * @returns depositCallData and KiteSafe contract address
 */
export default function useKiteSafe({
    chainId,
    token,
    vault,
    recipient,
    amount,
}: UseKiteSafeParams): UseKiteSafeResult {

    const contractAddress = useMemo(() => {
        // ✅ Safely access the addresses object
        if (!chainId || typeof chainId !== 'number') {
            console.warn('useKiteSafe: Invalid chainId:', chainId);
            return null;
        }

        const address = KITE_SAFE_ADDRESSES[chainId];
        if (!address) {
            console.log(`useKiteSafe: No KiteSafe contract deployed on chain ${chainId}`);
            return null;
        }

        return address;
    }, [chainId]);

    const depositCallData = useMemo(() => {
        // ✅ Return null if ANY required parameter is missing or invalid
        if (!contractAddress ||
            !token ||
            !vault ||
            !recipient ||
            amount === BigInt(0) ||
            vault === '0x0000000000000000000000000000000000000000' ||
            contractAddress === '0x0000000000000000000000000000000000000000') {

            console.log('useKiteSafe: Cannot generate calldata, invalid params:', {
                contractAddress,
                token,
                vault,
                recipient,
                amount: amount.toString(),
            });
            return null;
        }

        try {
            // ✅ Generate the calldata for the VAULT's deposit function
            // This gets passed as _data to safeDepositFor
            // Most ERC4626 vaults use deposit(uint256 assets, address receiver)
            const vaultDepositData = encodeFunctionData({
                abi: [
                    {
                        name: 'deposit',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'assets', type: 'uint256' },
                            { name: 'receiver', type: 'address' }
                        ],
                        outputs: [{ name: 'shares', type: 'uint256' }]
                    }
                ],
                functionName: 'deposit',
                args: [amount, contractAddress], // Deposit to KiteSafe, it will forward shares
            });

            // ✅ Generate calldata for safeDepositFor
            // This is what LI.FI will call on the KiteSafe contract
            const callData = encodeFunctionData({
                abi: KITE_SAFE_ABI,
                functionName: 'safeDepositFor',
                args: [
                    token,
                    vault,
                    recipient,  // User receives vault shares directly
                    amount,
                    '0x' as `0x${string}`  // Let KiteSafe handle the vault deposit internally
                ],
            });

            console.log('useKiteSafe: Generated calldata successfully');
            return callData as `0x${string}`;
        } catch (error) {
            console.error('Failed to encode KiteSafe deposit calldata:', error);
            return null;
        }
    }, [contractAddress, token, vault, recipient, amount]);

    return {
        depositCallData,
        contractAddress,
    };
}