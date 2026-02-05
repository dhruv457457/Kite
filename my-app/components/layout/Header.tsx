'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-silver bg-white/80 backdrop-blur-md shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-charcoal hover:text-cyber-yellow transition-colors">
              Kite
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-charcoal hover:text-cyber-yellow transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-yellow transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-charcoal hover:text-cyber-yellow transition-colors relative group"
            >
              My Profile
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-yellow transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-charcoal hover:text-cyber-yellow transition-colors relative group"
            >
              History
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-yellow transition-all group-hover:w-full"></span>
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