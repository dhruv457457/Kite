'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ENSSearch } from '@/components/home/ENSSearch';
import { ENSProfileCard } from '@/components/profile/ENSProfileCard';
import { KiteBackground } from '@/components/animations/KiteBackground';
import useENSProfile from '@/hooks/useENSProfile';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [searchedName, setSearchedName] = useState<string>('');

  // Fetch ENS profile when name is searched
  const { profile, isLoading: isLoadingProfile } = useENSProfile(searchedName);

  const handleSearch = (ensName: string) => {
    setSearchedName(ensName);
  };

  const handleSendToProfile = () => {
    if (searchedName) {
      router.push(`/send/${encodeURIComponent(searchedName)}`);
    }
  };

  return (
    <>
      <KiteBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-24 relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyber-yellow/10 via-transparent to-transparent blur-3xl -z-10"></div>

          {/* Badge - Powered by LI.FI */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-full mb-8">
            <svg className="w-4 h-4 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-charcoal">Powered by LI.FI</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-charcoal leading-tight">
            Cross-Chain DeFi Deposits
            <br />
            <span className="relative inline-block mt-2">
              Made Simple
              <span className="absolute bottom-0 left-0 w-full h-3 bg-cyber-yellow/30 -z-10"></span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate mb-12 leading-relaxed max-w-3xl mx-auto">
            Deposit into <strong className="text-charcoal">Aave, Morpho, Spark</strong> and any vault
            <br className="hidden md:block" />
            from any token, any chain — in one click.
          </p>

          {/* Supported Protocols Row with Icons */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-silver rounded-lg shadow-soft hover:shadow-md transition-shadow">
              <div className="relative w-5 h-5">
                <Image
                  src="https://cryptologos.cc/logos/aave-aave-logo.png?v=040"
                  alt="Aave"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-charcoal">Aave</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-silver rounded-lg shadow-soft hover:shadow-md transition-shadow">
              <div className="relative w-5 h-5">
                <Image
                  src="https://s2.coinmarketcap.com/static/img/coins/64x64/34104.png"
                  alt="Morpho"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-charcoal">Morpho</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-silver rounded-lg shadow-soft hover:shadow-md transition-shadow">
              <div className="relative w-5 h-5">
                <Image
                  src="https://pbs.twimg.com/profile_images/1643941027898613760/gyhYEOCE_400x400.jpg"
                  alt="Spark"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-charcoal">Spark</span>
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-silver rounded-lg shadow-soft hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-charcoal">+ Any Vault</span>
            </div>
          </div>

          {/* Supported Chains Row with Icons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors">
              <div className="relative w-5 h-5">
                <Image
                  src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040"
                  alt="Ethereum"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-charcoal">Ethereum</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors">
              <div className="relative w-5 h-5">
                <Image
                  src="https://avatars.githubusercontent.com/u/108554348?s=280&v=4"
                  alt="Base"
                  fill
                  className="object-contain rounded-full"
                  unoptimized
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-charcoal">Base</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-pink-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors">
              <div className="relative w-5 h-5">
                <Image
                  src="https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=040"
                  alt="Arbitrum"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-charcoal">Arbitrum</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-colors">
              <div className="relative w-5 h-5">
                <Image
                  src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040"
                  alt="Polygon"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-charcoal">Polygon</span>
            </div>
          </div>
        </div>

        {/* ENS Search */}
        <div className="max-w-2xl mx-auto mb-20">
          <ENSSearch onSearch={handleSearch} />
        </div>

        {/* ENS Profile Card */}
        {searchedName && (
          <div className="max-w-4xl mx-auto mb-20">
            {isLoadingProfile ? (
              <div className="bg-white border border-silver rounded-xl p-8 text-center shadow-soft">
                <div className="inline-block w-8 h-8 border-4 border-cyber-yellow border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate">Loading profile...</p>
              </div>
            ) : profile ? (
              <ENSProfileCard profile={profile} onSend={handleSendToProfile} />
            ) : (
              <div className="bg-white border border-silver rounded-xl p-8 text-center shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-yellow/10 border border-cyber-yellow/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-charcoal font-medium">No profile found for {searchedName}</p>
                <p className="text-sm text-slate mt-2">
                  This ENS name hasn't set up their Kite profile yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feature Cards */}
        {!searchedName && (
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft group">
              <div className="w-14 h-14 mb-6 rounded-full bg-cyber-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-charcoal">Auto-Yield Deposits</h3>
              <p className="text-slate leading-relaxed">
                Funds automatically start earning in Aave, Morpho, Spark, or any vault. No manual steps.
              </p>
            </div>

            <div className="p-8 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft group">
              <div className="w-14 h-14 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-charcoal">Smart Routing</h3>
              <p className="text-slate leading-relaxed">
                LI.FI finds the best swap + bridge path across 20+ chains automatically.
              </p>
            </div>

            <div className="p-8 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft group">
              <div className="w-14 h-14 mb-6 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-charcoal">ENS Profiles</h3>
              <p className="text-slate leading-relaxed">
                Set your vault once. Friends send to vitalik.eth, you earn yield instantly.
              </p>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        {!searchedName && (
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-cyber-yellow/5 to-transparent border border-cyber-yellow/20 rounded-2xl p-10 md:p-12 shadow-soft">
              <h3 className="text-3xl font-bold mb-12 text-charcoal text-center">How It Works</h3>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyber-yellow text-charcoal font-bold text-2xl flex items-center justify-center mb-5 shadow-md">
                    1
                  </div>
                  <h4 className="font-semibold text-lg text-charcoal mb-3">Pick Recipient</h4>
                  <p className="text-slate">Search any ENS name or wallet address</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyber-yellow text-charcoal font-bold text-2xl flex items-center justify-center mb-5 shadow-md">
                    2
                  </div>
                  <h4 className="font-semibold text-lg text-charcoal mb-3">LI.FI Routes</h4>
                  <p className="text-slate">Best swap + bridge + deposit path found</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyber-yellow text-charcoal font-bold text-2xl flex items-center justify-center mb-5 shadow-md">
                    3
                  </div>
                  <h4 className="font-semibold text-lg text-charcoal mb-3">Earn Yield</h4>
                  <p className="text-slate">Recipient gets vault shares, earning immediately</p>
                </div>
              </div>

              <div className="mt-10 p-6 bg-white/70 backdrop-blur-sm border border-silver rounded-lg">
                <p className="text-slate text-center leading-relaxed">
                  <strong className="text-charcoal">Example:</strong> USDC on Polygon →
                  <span className="text-cyber-yellow font-medium"> LI.FI routes to Base</span> →
                  Auto-deposits to Spark →
                  Earn <strong className="text-green-600">4.2% APY</strong> 🎯
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA for non-connected users */}
        {!isConnected && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-xl p-10 shadow-soft">
              <h3 className="text-2xl font-bold mb-4 text-charcoal">Ready to earn yield?</h3>
              <p className="text-slate mb-6 leading-relaxed">
                Connect your wallet to deposit into DeFi vaults across chains.
              </p>
              <p className="text-sm text-slate">
                Set up your <a href="/profile" className="text-cyber-yellow hover:text-cyber-yellow-dark font-medium underline">ENS profile</a> to start receiving auto-deposits.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}