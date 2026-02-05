'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ENSSearch } from '@/components/home/ENSSearch';
import { ENSProfileCard } from '@/components/profile/ENSProfileCard';
import { SwapFlow } from '@/components/swap/SwapFlow';
import { KiteBackground } from '@/components/animations/KiteBackground';
import useENSProfile from '@/hooks/useENSProfile';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [searchedName, setSearchedName] = useState<string>('');
  const [showSwapFlow, setShowSwapFlow] = useState(false);

  // Fetch ENS profile when name is searched
  const { profile, isLoading: isLoadingProfile } = useENSProfile(searchedName);

  const handleSearch = (ensName: string) => {
    setSearchedName(ensName);
    setShowSwapFlow(false);
  };

  const handleSendToProfile = () => {
    setShowSwapFlow(true);
  };

  const handleBackToProfile = () => {
    setShowSwapFlow(false);
  };

  return (
    <>
      <KiteBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative">
          {/* Subtle yellow radial glow background */}
          <div className="absolute inset-0 bg-gradient-radial from-cyber-yellow/10 via-transparent to-transparent blur-3xl -z-10"></div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-charcoal">
            Send Value to Anyone.
            <br />
            Just <span className="relative inline-block">
              Type a Name
              <span className="absolute bottom-0 left-0 w-full h-3 bg-cyber-yellow/30 -z-10"></span>
            </span>.
          </h1>
          <p className="text-xl text-slate mb-8">
            One-click cross-chain deposits into any DeFi vault using ENS names.
            <br />
            Swap, bridge, and deposit — all in a single transaction.
          </p>
        </div>

        {/* ENS Search */}
        <div className="max-w-2xl mx-auto mb-16">
          <ENSSearch onSearch={handleSearch} />
        </div>

        {/* ENS Profile Card or Swap Flow */}
        {searchedName && !showSwapFlow && (
          <div className="max-w-4xl mx-auto mb-16">
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

        {/* Swap Flow */}
        {showSwapFlow && profile && (
          <div className="max-w-6xl mx-auto mb-16">
            <SwapFlow
              recipientProfile={profile}
              onBack={handleBackToProfile}
            />
          </div>
        )}

        {/* Feature Cards */}
        {!searchedName && (
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft">
              <div className="w-12 h-12 mb-4 rounded-full bg-cyber-yellow/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-charcoal">One-Click Deposits</h3>
              <p className="text-slate">
                Type a name, pick your token, deposit. No manual bridging or swapping.
              </p>
            </div>

            <div className="p-6 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft">
              <div className="w-12 h-12 mb-4 rounded-full bg-slate/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-charcoal">Any Chain to Any Chain</h3>
              <p className="text-slate">
                Send from Ethereum, Arbitrum, Base, or Polygon to any vault on any chain.
              </p>
            </div>

            <div className="p-6 bg-white border border-silver rounded-xl hover:border-cyber-yellow hover:shadow-yellow-glow transition-all shadow-soft">
              <div className="w-12 h-12 mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-charcoal">Verified & Safe</h3>
              <p className="text-slate">
                KiteSafe contract verifies vault addresses and protects your deposits.
              </p>
            </div>
          </div>
        )}

        {/* CTA for non-connected users */}
        {!isConnected && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-xl p-8 shadow-soft">
              <h3 className="text-2xl font-bold mb-4 text-charcoal">Ready to get started?</h3>
              <p className="text-slate mb-6">
                Connect your wallet to search for ENS profiles and start sending cross-chain deposits.
              </p>
              <p className="text-sm text-slate">
                Don't have an ENS name? <a href="/profile" className="text-cyber-yellow hover:text-cyber-yellow-dark font-medium">Set up your profile</a> to receive deposits.
              </p>
            </div>
          </div>
        )}
      </div >
    </>
  );
}