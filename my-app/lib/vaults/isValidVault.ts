import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';

// Minimal ERC-4626 check
const VAULT_ABI = [
    {
        name: 'asset',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address' }],
    },
] as const;

/**
 * Check if address is a valid vault
 * Returns true if it has the ERC-4626 'asset()' function
 */
export async function isValidVault(
    address: Address,
    chainId: number
): Promise<boolean> {
    try {
        const client = createPublicClient({
            chain: base, // Change based on chainId
            transport: http(),
        });

        // Try to call asset() - if it works, it's a vault
        await client.readContract({
            address,
            abi: VAULT_ABI,
            functionName: 'asset',
        });

        return true; // ✅ It's a vault!
    } catch {
        return false; // ❌ Not a vault
    }
}