'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

export function KiteBackground() {
    const shouldReduceMotion = useReducedMotion();

    // Generate stable random positions for elements
    const sparklePositions = useMemo(() =>
        Array.from({ length: 8 }, () => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
        })), []
    );

    // Cloud configurations
    const clouds = useMemo(() => [
        { duration: 80, top: '15%', scale: 1.2, opacity: 0.4 },
        { duration: 100, top: '45%', scale: 1, opacity: 0.3 },
        { duration: 90, top: '70%', scale: 1.3, opacity: 0.35 },
    ], []);

    // DeFi protocol floating icons with real logos
    const protocolIcons = useMemo(() => [
        {
            name: 'Aave',
            logo: 'https://cryptologos.cc/logos/aave-aave-logo.png?v=040',
            top: '18%',
            left: '75%',
            duration: 8,
            gradient: 'from-blue-100 to-purple-100',
            border: 'border-blue-300/40',
        },
        {
            name: 'Morpho',
            logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/34104.png',
            top: '65%',
            left: '20%',
            duration: 9,
            gradient: 'from-indigo-100 to-blue-100',
            border: 'border-indigo-300/40',
        },
        {
            name: 'Spark',
            logo: 'https://pbs.twimg.com/profile_images/1643941027898613760/gyhYEOCE_400x400.jpg',
            top: '42%',
            left: '85%',
            duration: 7,
            gradient: 'from-yellow-100 to-orange-100',
            border: 'border-yellow-300/40',
        },
    ], []);

    // Kite configurations
    const kites = useMemo(() => [
        {
            id: 'kite-1',
            size: 90,
            path: { x: ['0vw', '80vw', '10vw'], y: ['0vh', '60vh', '10vh'] },
            duration: 60,
            initialPosition: { top: '20%', left: '10%' },
        },
        {
            id: 'kite-2',
            size: 70,
            path: { x: ['-10vw', '-60vw', '-5vw'], y: ['-10vh', '20vh', '-5vh'] },
            duration: 50,
            initialPosition: { top: '60%', left: '70%' },
        },
        {
            id: 'kite-3',
            size: 65,
            path: { x: ['0vw', '-40vw', '20vw'], y: ['0vh', '50vh', '5vh'] },
            duration: 55,
            initialPosition: { top: '10%', left: '50%' },
        },
    ], []);

    if (shouldReduceMotion) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyber-yellow/5 to-purple-50" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyber-yellow/5 to-purple-50"
                animate={{
                    background: [
                        'linear-gradient(to bottom right, #eff6ff, #fef9c3, #faf5ff)',
                        'linear-gradient(to bottom right, #faf5ff, #eff6ff, #fef9c3)',
                        'linear-gradient(to bottom right, #fef9c3, #faf5ff, #eff6ff)',
                    ],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Floating Sparkles - Reduced count */}
            {sparklePositions.map((pos, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{ top: pos.top, left: pos.left }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: pos.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path
                            d="M3 0L3.5 2.5L6 3L3.5 3.5L3 6L2.5 3.5L0 3L2.5 2.5L3 0Z"
                            fill="#FFD700"
                            opacity="0.5"
                        />
                    </svg>
                </motion.div>
            ))}

            {/* Enhanced Clouds with Parallax */}
            {clouds.map((cloud, i) => (
                <motion.div
                    key={`cloud-${i}`}
                    className="absolute hidden md:block"
                    style={{ top: cloud.top, left: '-15%' }}
                    animate={{
                        x: ['0vw', '115vw'],
                        y: [0, Math.sin(i) * 20, 0],
                    }}
                    transition={{
                        x: { duration: cloud.duration, repeat: Infinity, ease: 'linear' },
                        y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                        delay: i * 5,
                    }}
                >
                    <svg
                        width={120 * cloud.scale}
                        height={60 * cloud.scale}
                        viewBox="0 0 120 60"
                        fill="none"
                    >
                        <ellipse cx="30" cy="35" rx="25" ry="20" fill="#FFFFFF" opacity={cloud.opacity} />
                        <ellipse cx="55" cy="30" rx="30" ry="25" fill="#FFFFFF" opacity={cloud.opacity} />
                        <ellipse cx="85" cy="35" rx="28" ry="22" fill="#FFFFFF" opacity={cloud.opacity} />
                    </svg>
                </motion.div>
            ))}

            {/* DeFi Protocol Floating Icons with Real Logos */}
            {protocolIcons.map((protocol, i) => (
                <motion.div
                    key={protocol.name}
                    className="absolute hidden lg:block"
                    style={{ top: protocol.top, left: protocol.left }}
                    animate={{
                        y: i % 2 === 0 ? [-20, 20, -20] : [20, -20, 20],
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        y: { duration: protocol.duration, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 50 + i * 5, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    }}
                >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${protocol.gradient} border-2 ${protocol.border} flex items-center justify-center shadow-lg overflow-hidden`}>
                        <div className="relative w-7 h-7">
                            <Image
                                src={protocol.logo}
                                alt={protocol.name}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Ethereum Icon - Enhanced with Logo */}
            <motion.div
                className="absolute hidden lg:block"
                style={{ top: '55%', left: '12%' }}
                animate={{
                    y: [18, -18, 18],
                    rotate: [0, -360],
                    scale: [1, 1.12, 1],
                }}
                transition={{
                    y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-cyber-yellow/20 rounded-full blur-xl"></div>
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-cyber-yellow/40 flex items-center justify-center shadow-lg overflow-hidden relative">
                        <Image
                            src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040"
                            alt="Ethereum"
                            fill
                            className="object-contain p-2"
                            unoptimized
                        />
                    </div>
                </div>
            </motion.div>

            {/* Animated Kites */}
            {kites.map((kite, index) => (
                <motion.div
                    key={kite.id}
                    className="absolute hidden md:block"
                    style={kite.initialPosition}
                    animate={{
                        x: kite.path.x,
                        y: kite.path.y,
                        rotate: [0, 25, -15, 0],
                    }}
                    transition={{
                        duration: kite.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 10,
                    }}
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-cyber-yellow/20 rounded-full blur-2xl scale-150"></div>

                        <svg width={kite.size} height={kite.size} viewBox="0 0 90 90" fill="none">
                            <g opacity="0.7">
                                <path
                                    d="M45 5 L80 45 L45 80 L10 45 Z"
                                    fill={`url(#kiteGradient-${index})`}
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                    filter="url(#shadow)"
                                />
                                <line x1="45" y1="5" x2="45" y2="80" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                                <line x1="10" y1="45" x2="80" y2="45" stroke="#FFD700" strokeWidth="1" opacity="0.6" />

                                {/* Decorative dots */}
                                <circle cx="45" cy="25" r="2.5" fill="#FFD700" opacity="0.8" />
                                <circle cx="60" cy="45" r="2.5" fill="#FFD700" opacity="0.8" />
                                <circle cx="45" cy="65" r="2.5" fill="#FFD700" opacity="0.8" />
                                <circle cx="30" cy="45" r="2.5" fill="#FFD700" opacity="0.8" />
                            </g>
                            <defs>
                                <linearGradient id={`kiteGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
                                    <stop offset="50%" stopColor="#FFED4E" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#E6C200" stopOpacity="0.35" />
                                </linearGradient>
                                <filter id="shadow">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                                </filter>
                            </defs>
                        </svg>

                        {/* Kite String */}
                        <motion.svg
                            width="2"
                            height={kite.size * 2.2}
                            viewBox={`0 0 2 ${kite.size * 2.2}`}
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ top: `${kite.size}px` }}
                        >
                            <motion.path
                                d={`M1 0 Q${kite.size / 15} ${kite.size * 0.6} 1 ${kite.size * 1.2} Q${-kite.size / 15} ${kite.size * 1.8} 1 ${kite.size * 2.2}`}
                                stroke="#FFD700"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.6"
                                animate={{
                                    d: [
                                        `M1 0 Q${kite.size / 15} ${kite.size * 0.6} 1 ${kite.size * 1.2} Q${-kite.size / 15} ${kite.size * 1.8} 1 ${kite.size * 2.2}`,
                                        `M1 0 Q${-kite.size / 15} ${kite.size * 0.6} 1 ${kite.size * 1.2} Q${kite.size / 15} ${kite.size * 1.8} 1 ${kite.size * 2.2}`,
                                        `M1 0 Q${kite.size / 15} ${kite.size * 0.6} 1 ${kite.size * 1.2} Q${-kite.size / 15} ${kite.size * 1.8} 1 ${kite.size * 2.2}`,
                                    ],
                                }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        </motion.svg>
                    </div>
                </motion.div>
            ))}

            {/* Floating Chain Logos in corners */}
            <motion.div
                className="absolute top-10 right-10 hidden xl:block"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{
                    rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity }
                }}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-blue-300/30 overflow-hidden flex items-center justify-center">
                    <Image
                        src="https://avatars.githubusercontent.com/u/108554348?s=280&v=4"
                        alt="Base"
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                    />
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-10 left-10 hidden xl:block"
                animate={{ rotate: -360, scale: [1, 1.08, 1] }}
                transition={{
                    rotate: { duration: 45, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3.5, repeat: Infinity }
                }}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-300/30 overflow-hidden flex items-center justify-center">
                    <Image
                        src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040"
                        alt="Polygon"
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                    />
                </div>
            </motion.div>
        </div>
    );
}