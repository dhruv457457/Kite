'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  const [ensQuery, setEnsQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement ENS search later
    console.log('Searching for:', ensQuery);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Send Value to Anyone.
          <br />
          Just Type a Name.
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          One-click cross-chain deposits into any DeFi vault using ENS names.
          <br />
          Swap, bridge, and deposit — all in a single transaction.
        </p>
      </div>

      {/* ENS Search */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search alex.eth, maya.eth, jake.eth..."
            value={ensQuery}
            onChange={(e) => setEnsQuery(e.target.value)}
            className="w-full px-6 py-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={!isConnected || !ensQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Search
          </button>
        </form>
        {!isConnected && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            Connect your wallet to start searching
          </p>
        )}
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-2">One-Click Deposits</h3>
          <p className="text-gray-400">
            Type a name, pick your token, deposit. No manual bridging or swapping.
          </p>
        </div>

        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <div className="text-3xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">Any Chain to Any Chain</h3>
          <p className="text-gray-400">
            Send from Ethereum, Arbitrum, Base, or Polygon to any vault on any chain.
          </p>
        </div>

        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Verified & Safe</h3>
          <p className="text-gray-400">
            Kite Safe verifies vault addresses and protects your deposits.
          </p>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      {isConnected && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 text-center text-gray-500">
            No recent activity yet. Start by searching for an ENS name above.
          </div>
        </div>
      )}
    </div>
  );
}