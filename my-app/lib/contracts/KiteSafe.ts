import { encodeFunctionData, type Abi } from 'viem';

/**
 * KiteSafe Contract ABI
 * 
 * ✅ UPDATED: Added safeDepositFor function for "send to recipient" flows
 * 
 * KiteSafe is a security wrapper contract that:
 * - Validates deposit parameters before execution
 * - Handles token approvals and transfers safely
 * - Supports depositing on behalf of recipients
 * - Emits events for tracking deposits
 * - Provides emergency recovery mechanisms
 */
export const KITE_SAFE_ABI = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'OwnableInvalidOwner',
        type: 'error',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
            { indexed: true, internalType: 'address', name: 'target', type: 'address' },
            { indexed: true, internalType: 'address', name: 'recipient', type: 'address' }, // ✅ Added recipient
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'DepositVerified',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'token', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'EmergencyRecovery',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
            { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'recoverTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_vault', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' },
        ],
        name: 'safeDeposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    // ✅ NEW: safeDepositFor function
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_vault', type: 'address' },
            { internalType: 'address', name: '_recipient', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' },
        ],
        name: 'safeDepositFor',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const satisfies Abi;

/**
 * ✅ NEW: Encode calldata for KiteSafe safeDepositFor function
 * 
 * This function creates the hex-encoded transaction data needed to call
 * safeDepositFor on the KiteSafe contract. The encoded data can be passed
 * to LI.FI's Composer mode for execution at the destination chain.
 * 
 * @param token - Address of the token being deposited
 * @param vault - Address of the vault to deposit into
 * @param recipient - Address who will receive the vault shares
 * @param amount - Amount to deposit in wei/smallest unit
 * @param data - Calldata for the vault's deposit function
 * @returns Hex-encoded calldata for the safeDepositFor function
 * 
 * @example
 * // Deposit USDC to Aave vault for alice.eth
 * const calldata = encodeSafeDepositForData(
 *   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
 *   '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave USDC vault
 *   '0xAliceAddress', // Alice receives vault shares
 *   BigInt('1000000'), // 1 USDC (6 decimals)
 *   vaultCalldata // Encoded vault.deposit() call
 * );
 */
export function encodeSafeDepositForData(
    token: `0x${string}`,
    vault: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    data: `0x${string}` = '0x'
): `0x${string}` {
    try {
        const encoded = encodeFunctionData({
            abi: KITE_SAFE_ABI,
            functionName: 'safeDepositFor',
            args: [token, vault, recipient, amount, data],
        });

        return encoded;
    } catch (error) {
        console.error('Failed to encode safe deposit for data:', error);
        throw new Error(
            `Failed to encode safe deposit for data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Encode calldata for KiteSafe safeDeposit function (legacy - for self-deposits)
 * 
 * @param token - Address of the token being deposited (use 0x0 for native ETH)
 * @param vault - Address of the vault to deposit into (e.g., Aave, Yearn)
 * @param amount - Amount to deposit in wei/smallest unit
 * @param data - Additional calldata for the vault (usually empty '0x' for standard deposits)
 * @returns Hex-encoded calldata for the safeDeposit function
 */
export function encodeSafeDepositData(
    token: `0x${string}`,
    vault: `0x${string}`,
    amount: bigint,
    data: `0x${string}` = '0x'
): `0x${string}` {
    try {
        const encoded = encodeFunctionData({
            abi: KITE_SAFE_ABI,
            functionName: 'safeDeposit',
            args: [token, vault, amount, data],
        });

        return encoded;
    } catch (error) {
        console.error('Failed to encode safe deposit data:', error);
        throw new Error(
            `Failed to encode safe deposit data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Validate KiteSafe deposit parameters
 * 
 * @param token - Token address
 * @param vault - Vault address
 * @param amount - Deposit amount
 * @param recipient - Optional recipient address (for safeDepositFor)
 * @returns True if parameters are valid
 */
export function validateSafeDepositParams(
    token: string,
    vault: string,
    amount: bigint,
    recipient?: string
): boolean {
    // Check addresses are valid (0x followed by 40 hex chars)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;

    if (!addressRegex.test(token)) {
        console.error('Invalid token address:', token);
        return false;
    }

    if (!addressRegex.test(vault)) {
        console.error('Invalid vault address:', vault);
        return false;
    }

    if (recipient && !addressRegex.test(recipient)) {
        console.error('Invalid recipient address:', recipient);
        return false;
    }

    if (amount <= BigInt(0)) {
        console.error('Amount must be greater than 0');
        return false;
    }

    return true;
}