import { useMemo } from 'react';
import { useEnsAddress, useEnsAvatar, useEnsText } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { normalize } from 'viem/ens';
import { ENSProfile } from '@/types/ens';
import { KITE_TEXT_RECORDS } from '@/lib/ens/textRecords';

interface UseENSProfileResult {
    profile: ENSProfile | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to read ENS profile and Kite-specific text records
 * @param ensName - The ENS name to look up (e.g., "vitalik.eth")
 * @returns Profile data, loading state, and error
 */
export default function useENSProfile(ensName: string): UseENSProfileResult {
    // Normalize the ENS name
    const normalizedName = useMemo(() => {
        try {
            if (!ensName || !ensName.endsWith('.eth')) return null;
            return normalize(ensName);
        } catch {
            return null;
        }
    }, [ensName]);

    // Resolve ENS name to address
    const {
        data: address,
        isLoading: isLoadingAddress,
        error: addressError,
    } = useEnsAddress({
        name: normalizedName || undefined,
        chainId: mainnet.id,
    });

    // Get avatar
    const {
        data: avatar,
        isLoading: isLoadingAvatar,
    } = useEnsAvatar({
        name: normalizedName || undefined,
        chainId: mainnet.id,
    });

    // Get Kite text records
    const {
        data: preferredChain,
        isLoading: isLoadingChain,
    } = useEnsText({
        name: normalizedName || undefined,
        key: KITE_TEXT_RECORDS.PREFERRED_CHAIN,
        chainId: mainnet.id,
    });

    const {
        data: preferredToken,
        isLoading: isLoadingToken,
    } = useEnsText({
        name: normalizedName || undefined,
        key: KITE_TEXT_RECORDS.PREFERRED_TOKEN,
        chainId: mainnet.id,
    });

    const {
        data: depositTarget,
        isLoading: isLoadingTarget,
    } = useEnsText({
        name: normalizedName || undefined,
        key: KITE_TEXT_RECORDS.DEPOSIT_TARGET,
        chainId: mainnet.id,
    });

    // Aggregate loading state
    const isLoading = useMemo(() => {
        return (
            isLoadingAddress ||
            isLoadingAvatar ||
            isLoadingChain ||
            isLoadingToken ||
            isLoadingTarget
        );
    }, [
        isLoadingAddress,
        isLoadingAvatar,
        isLoadingChain,
        isLoadingToken,
        isLoadingTarget,
    ]);

    // Build profile object
    const profile = useMemo((): ENSProfile | null => {
        if (!normalizedName || !address) return null;

        return {
            name: normalizedName,
            address,
            preferredChain: preferredChain || undefined,
            preferredToken: preferredToken || undefined,
            depositTarget: depositTarget as `0x${string}` | undefined,
            avatar: avatar || undefined,
        };
    }, [normalizedName, address, preferredChain, preferredToken, depositTarget, avatar]);

    // Handle errors
    const error = useMemo(() => {
        if (addressError) {
            return new Error(`Failed to resolve ENS name: ${addressError.message}`);
        }
        if (!normalizedName && ensName) {
            return new Error('Invalid ENS name format');
        }
        return null;
    }, [addressError, normalizedName, ensName]);

    return {
        profile,
        isLoading,
        error,
    };
}
