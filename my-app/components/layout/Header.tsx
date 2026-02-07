'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-silver/30 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              {/* Kite Icon */}
              <svg className="w-8 h-8 text-cyber-yellow group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 14h8v8l8-12h-8V2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-charcoal to-cyber-yellow bg-clip-text text-transparent">
              Kite
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive('/')
                  ? 'bg-cyber-yellow/10 text-cyber-yellow'
                  : 'text-slate hover:bg-light-grey hover:text-charcoal'
                }`}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive('/profile')
                  ? 'bg-cyber-yellow/10 text-cyber-yellow'
                  : 'text-slate hover:bg-light-grey hover:text-charcoal'
                }`}
            >
              My Profile
            </Link>
            <Link
              href="/history"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive('/history')
                  ? 'bg-cyber-yellow/10 text-cyber-yellow'
                  : 'text-slate hover:bg-light-grey hover:text-charcoal'
                }`}
            >
              History
            </Link>
          </nav>

          {/* Wallet Connect - Custom Styled */}
          <div className="flex items-center">
            <div className="[&_button]:bg-cyber-yellow [&_button]:hover:bg-cyber-yellow-dark [&_button]:text-charcoal [&_button]:font-semibold [&_button]:shadow-md [&_button]:border-0 [&_button]:transition-all [&_button]:hover:shadow-yellow-glow">
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

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex items-center justify-center space-x-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isActive('/')
                ? 'bg-cyber-yellow/10 text-cyber-yellow'
                : 'text-slate hover:bg-light-grey'
              }`}
          >
            Home
          </Link>
          <Link
            href="/profile"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isActive('/profile')
                ? 'bg-cyber-yellow/10 text-cyber-yellow'
                : 'text-slate hover:bg-light-grey'
              }`}
          >
            Profile
          </Link>
          <Link
            href="/history"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isActive('/history')
                ? 'bg-cyber-yellow/10 text-cyber-yellow'
                : 'text-slate hover:bg-light-grey'
              }`}
          >
            History
          </Link>
        </div>
      </div>
    </header>
  );
}