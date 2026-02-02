import { base, mainnet, arbitrum, polygon } from 'wagmi/chains';

export const supportedChains = [base, mainnet, arbitrum, polygon] as const;

export const defaultChain = base;

// Chain metadata for UI
export const chainMetadata = {
    [base.id]: {
        name: 'Base',
        color: '#0052FF',
        icon: '/chains/base.svg',
    },
    [mainnet.id]: {
        name: 'Ethereum',
        color: '#627EEA',
        icon: '/chains/ethereum.svg',
    },
    [arbitrum.id]: {
        name: 'Arbitrum',
        color: '#28A0F0',
        icon: '/chains/arbitrum.svg',
    },
    [polygon.id]: {
        name: 'Polygon',
        color: '#8247E5',
        icon: '/chains/polygon.svg',
    },
} as const;