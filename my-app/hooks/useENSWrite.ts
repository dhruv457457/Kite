import { useState, useCallback } from 'react';
import { useAccount, useEnsName, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { namehash, encodeFunctionData } from 'viem';
import { KITE_TEXT_RECORDS } from '@/lib/ens/textRecords';

/**
 * Standard ENS Public Resolver ABI for multicall and setText
 */
const RESOLVER_ABI = [
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    name: 'setText',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', type: 'bytes[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function useENSWrite() {
  const { address, chainId } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const { switchChainAsync } = useSwitchChain();

  const [isWriting, setIsWriting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setKiteProfile = useCallback(async (
    preferredChain: string,
    preferredToken: string,
    depositTarget: string
  ) => {
    setIsWriting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // 1. Ensure the wallet is on Ethereum Mainnet for ENS writes
      if (chainId !== mainnet.id) {
        await switchChainAsync({ chainId: mainnet.id });
      }

      if (!walletClient || !publicClient || !ensName || !address) {
        throw new Error('Environment not ready. Please check your connection.');
      }

      // 2. Fetch the Resolver Address for this ENS name
      const resolverAddress = await publicClient.getEnsResolver({ name: ensName });
      if (!resolverAddress) throw new Error('No ENS resolver found for this name.');

      const node = namehash(ensName);

      // 3. Encode the three setText calls into a single data array
      const calls = [
        { key: KITE_TEXT_RECORDS.PREFERRED_CHAIN, value: preferredChain },
        { key: KITE_TEXT_RECORDS.PREFERRED_TOKEN, value: preferredToken },
        { key: KITE_TEXT_RECORDS.DEPOSIT_TARGET, value: depositTarget },
      ].map(rec => encodeFunctionData({
        abi: RESOLVER_ABI,
        functionName: 'setText',
        args: [node, rec.key, rec.value]
      }));

      // 4. Execute as ONE transaction using multicall
      const hash = await walletClient.writeContract({
        address: resolverAddress,
        abi: RESOLVER_ABI,
        functionName: 'multicall',
        args: [calls],
        chain: mainnet,
        account: address
      });

      // 5. Wait for the transaction to be indexed
      await publicClient.waitForTransactionReceipt({ hash });
      setIsSuccess(true);

    } catch (err: any) {
      console.error('ENS Multicall Write Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to save Kite profile.'));
      throw err;
    } finally {
      setIsWriting(false);
    }
  }, [address, chainId, ensName, walletClient, publicClient, switchChainAsync]);

  return { setKiteProfile, isWriting, isSuccess, error, reset: () => setIsSuccess(false) };
}