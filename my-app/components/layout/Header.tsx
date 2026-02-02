'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Kite
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              History
            </Link>
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}