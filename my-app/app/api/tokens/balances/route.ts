import { NextRequest, NextResponse } from 'next/server';

// Map chain IDs to Alchemy RPC URLs
const ALCHEMY_URLS: Record<number, string> = {
    1: 'https://eth-mainnet.g.alchemy.com/v2',
    8453: 'https://base-mainnet.g.alchemy.com/v2',
    42161: 'https://arb-mainnet.g.alchemy.com/v2',
    137: 'https://polygon-mainnet.g.alchemy.com/v2',
};

interface TokenBalance {
    contractAddress: string;
    tokenBalance: string;
}

interface TokenMetadata {
    decimals: number | null;
    logo: string | null;
    name: string | null;
    symbol: string | null;
}

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.text();

        if (!body) {
            return NextResponse.json(
                { error: 'Empty request body' },
                { status: 400 }
            );
        }

        const { address, chainId } = JSON.parse(body);

        if (!address || !chainId) {
            return NextResponse.json(
                { error: 'Missing address or chainId' },
                { status: 400 }
            );
        }

        // Get the Alchemy base URL for this chain
        const baseUrl = ALCHEMY_URLS[chainId];
        if (!baseUrl) {
            return NextResponse.json(
                { error: `Unsupported chain ID: ${chainId}` },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

        if (!apiKey) {
            console.error('❌ ALCHEMY_API_KEY not found in environment variables');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const alchemyUrl = `${baseUrl}/${apiKey}`;

        // Fetch token balances using Alchemy's JSON-RPC API
        const balancesResponse = await fetch(alchemyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'alchemy_getTokenBalances',
                params: [address, 'erc20'],
                id: 42,
            }),
        });

        if (!balancesResponse.ok) {
            throw new Error(`Alchemy API error: ${balancesResponse.status} ${balancesResponse.statusText}`);
        }

        const balancesData = await balancesResponse.json();

        if (balancesData.error) {
            throw new Error(`Alchemy RPC error: ${balancesData.error.message}`);
        }

        const tokenBalances: TokenBalance[] = balancesData.result?.tokenBalances || [];

        // Filter out zero balances
        const nonZeroBalances = tokenBalances.filter(
            (token) => token.tokenBalance &&
                token.tokenBalance !== '0x0' &&
                token.tokenBalance !== '0x' &&
                token.tokenBalance !== '0'
        );

        // Fetch metadata for each token
        const tokensWithMetadata = await Promise.all(
            nonZeroBalances.map(async (token) => {
                try {
                    const metadataResponse = await fetch(alchemyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            method: 'alchemy_getTokenMetadata',
                            params: [token.contractAddress],
                            id: 42,
                        }),
                    });

                    if (!metadataResponse.ok) {
                        console.warn(`⚠️ Failed to fetch metadata for ${token.contractAddress}`);
                        return {
                            contractAddress: token.contractAddress,
                            balance: token.tokenBalance,
                            symbol: 'UNKNOWN',
                            decimals: 18,
                            name: 'Unknown Token',
                        };
                    }

                    const metadataData = await metadataResponse.json();
                    const metadata: TokenMetadata = metadataData.result || {};

                    return {
                        contractAddress: token.contractAddress,
                        balance: token.tokenBalance,
                        symbol: metadata.symbol || 'UNKNOWN',
                        decimals: metadata.decimals ?? 18,
                        name: metadata.name || 'Unknown Token',
                    };
                } catch (err) {
                    console.error(`⚠️ Error fetching metadata for ${token.contractAddress}:`, err);
                    return {
                        contractAddress: token.contractAddress,
                        balance: token.tokenBalance,
                        symbol: 'UNKNOWN',
                        decimals: 18,
                        name: 'Unknown Token',
                    };
                }
            })
        );

        const validTokens = tokensWithMetadata.filter(Boolean);

        return NextResponse.json({
            tokens: validTokens,
            chainId,
            address,
        });

    } catch (error) {
        console.error('❌ Error fetching token balances:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch token balances',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Ensure route is dynamic
export const dynamic = 'force-dynamic';