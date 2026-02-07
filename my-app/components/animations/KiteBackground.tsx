'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function KiteBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
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

            {/* Floating Sparkles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: 'easeInOut',
                    }}
                >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                            d="M4 0L4.5 3.5L8 4L4.5 4.5L4 8L3.5 4.5L0 4L3.5 3.5L4 0Z"
                            fill="#FFD700"
                            opacity="0.6"
                        />
                    </svg>
                </motion.div>
            ))}

            {/* Enhanced Clouds with Parallax */}
            {[
                { duration: 80, top: '15%', scale: 1.2, opacity: 0.5 },
                { duration: 100, top: '45%', scale: 1, opacity: 0.4 },
                { duration: 90, top: '70%', scale: 1.4, opacity: 0.45 },
                { duration: 70, top: '30%', scale: 0.9, opacity: 0.35 },
            ].map((cloud, i) => (
                <motion.div
                    key={`cloud-${i}`}
                    className="absolute"
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

            {/* DeFi Protocol Floating Icons */}
            {/* Aave Icon */}
            <motion.div
                className="absolute"
                style={{ top: '18%', left: '75%' }}
                animate={{
                    y: [-25, 25, -25],
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 50, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300/40 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🌊</span>
                </div>
            </motion.div>

            {/* Morpho Icon */}
            <motion.div
                className="absolute"
                style={{ top: '65%', left: '20%' }}
                animate={{
                    y: [20, -20, 20],
                    rotate: [0, -360],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    y: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 55, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-indigo-300/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🔷</span>
                </div>
            </motion.div>

            {/* Spark Icon */}
            <motion.div
                className="absolute"
                style={{ top: '42%', left: '85%' }}
                animate={{
                    y: [-15, 15, -15],
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 45, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">⚡</span>
                </div>
            </motion.div>

            {/* Ethereum Icon - Enhanced */}
            <motion.div
                className="absolute"
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
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                        <circle cx="25" cy="25" r="23" stroke="#FFD700" strokeWidth="2" opacity="0.5" />
                        <path d="M25 10L24.5 11.8v19.4l.5.5 8-4.7L25 10z" fill="#FFD700" opacity="0.6" />
                        <path d="M25 10l-8 15 8 4.7V10z" fill="#FFD700" opacity="0.5" />
                        <path d="M25 33.2l-.3.4v6.1l.3.8 8-11.3-8 4z" fill="#FFD700" opacity="0.6" />
                        <path d="M25 40.5v-7.3l-8-4.7 8 12z" fill="#FFD700" opacity="0.5" />
                    </svg>
                </div>
            </motion.div>

            {/* Network Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
                <motion.line
                    x1="20%" y1="20%" x2="80%" y2="60%"
                    stroke="#FFD700"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.line
                    x1="75%" y1="18%" x2="20%" y2="65%"
                    stroke="#FFD700"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
                <motion.line
                    x1="85%" y1="42%" x2="12%" y2="55%"
                    stroke="#FFD700"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </svg>

            {/* Enhanced Animated Kite 1 - Large with glow */}
            <motion.div
                className="absolute"
                style={{ top: '20%', left: '10%' }}
                animate={{
                    x: ['0vw', '80vw', '10vw'],
                    y: ['0vh', '60vh', '10vh'],
                    rotate: [0, 25, -15, 0],
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-cyber-yellow/30 rounded-full blur-2xl scale-150"></div>

                    <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                        <g opacity="0.75">
                            <path
                                d="M45 5 L80 45 L45 80 L10 45 Z"
                                fill="url(#kiteGradient1)"
                                stroke="#FFD700"
                                strokeWidth="2.5"
                                filter="url(#shadow)"
                            />
                            <line x1="45" y1="5" x2="45" y2="80" stroke="#FFD700" strokeWidth="1" opacity="0.7" />
                            <line x1="10" y1="45" x2="80" y2="45" stroke="#FFD700" strokeWidth="1" opacity="0.7" />

                            {/* Decorative dots */}
                            <circle cx="45" cy="25" r="3" fill="#FFD700" opacity="0.8" />
                            <circle cx="60" cy="45" r="3" fill="#FFD700" opacity="0.8" />
                            <circle cx="45" cy="65" r="3" fill="#FFD700" opacity="0.8" />
                            <circle cx="30" cy="45" r="3" fill="#FFD700" opacity="0.8" />
                        </g>
                        <defs>
                            <linearGradient id="kiteGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#FFED4E" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#E6C200" stopOpacity="0.45" />
                            </linearGradient>
                            <filter id="shadow">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                            </filter>
                        </defs>
                    </svg>

                    {/* Enhanced String with more movement */}
                    <motion.svg
                        width="3"
                        height="220"
                        viewBox="0 0 3 220"
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '90px' }}
                    >
                        <motion.path
                            d="M1.5 0 Q8 55 1.5 110 Q-5 165 1.5 220"
                            stroke="#FFD700"
                            strokeWidth="2.5"
                            fill="none"
                            opacity="0.7"
                            animate={{
                                d: [
                                    'M1.5 0 Q8 55 1.5 110 Q-5 165 1.5 220',
                                    'M1.5 0 Q-5 55 1.5 110 Q8 165 1.5 220',
                                    'M1.5 0 Q8 55 1.5 110 Q-5 165 1.5 220',
                                ],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.g
                            animate={{
                                x: [-3, 3, -3],
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <circle cx="1.5" cy="185" r="4" fill="#FFD700" opacity="0.8" />
                            <circle cx="1.5" cy="200" r="3.5" fill="#FFD700" opacity="0.7" />
                            <circle cx="1.5" cy="213" r="3" fill="#FFD700" opacity="0.6" />
                        </motion.g>
                    </motion.svg>
                </div>
            </motion.div>

            {/* Enhanced Animated Kite 2 - Medium with wave motion */}
            <motion.div
                className="absolute"
                style={{ top: '60%', left: '70%' }}
                animate={{
                    x: ['-10vw', '-60vw', '-5vw'],
                    y: ['-10vh', '20vh', '-5vh'],
                    rotate: [10, -20, 10],
                }}
                transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 5,
                }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-cyber-yellow/25 rounded-full blur-xl scale-125"></div>

                    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                        <g opacity="0.7">
                            <path
                                d="M35 5 L62 35 L35 62 L8 35 Z"
                                fill="url(#kiteGradient2)"
                                stroke="#FFD700"
                                strokeWidth="2.2"
                                filter="url(#shadow)"
                            />
                            <line x1="35" y1="5" x2="35" y2="62" stroke="#FFD700" strokeWidth="0.8" opacity="0.65" />
                            <line x1="8" y1="35" x2="62" y2="35" stroke="#FFD700" strokeWidth="0.8" opacity="0.65" />

                            <circle cx="35" cy="20" r="2.5" fill="#FFED4E" opacity="0.85" />
                            <circle cx="50" cy="35" r="2.5" fill="#FFED4E" opacity="0.85" />
                            <circle cx="35" cy="50" r="2.5" fill="#FFED4E" opacity="0.85" />
                            <circle cx="20" cy="35" r="2.5" fill="#FFED4E" opacity="0.85" />
                        </g>
                        <defs>
                            <linearGradient id="kiteGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFED4E" stopOpacity="0.55" />
                                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <motion.svg
                        width="2.5"
                        height="170"
                        viewBox="0 0 2.5 170"
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '70px' }}
                    >
                        <motion.path
                            d="M1.25 0 Q5 42.5 1.25 85 Q-2.5 127.5 1.25 170"
                            stroke="#FFD700"
                            strokeWidth="2.2"
                            fill="none"
                            opacity="0.65"
                            animate={{
                                d: [
                                    'M1.25 0 Q5 42.5 1.25 85 Q-2.5 127.5 1.25 170',
                                    'M1.25 0 Q-2.5 42.5 1.25 85 Q5 127.5 1.25 170',
                                    'M1.25 0 Q5 42.5 1.25 85 Q-2.5 127.5 1.25 170',
                                ],
                            }}
                            transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.g
                            animate={{
                                x: [-2, 2, -2],
                            }}
                            transition={{
                                duration: 2.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <circle cx="1.25" cy="145" r="3.5" fill="#FFD700" opacity="0.75" />
                            <circle cx="1.25" cy="157" r="3" fill="#FFD700" opacity="0.65" />
                        </motion.g>
                    </motion.svg>
                </div>
            </motion.div>

            {/* Enhanced Animated Kite 3 - Diagonal movement */}
            <motion.div
                className="absolute"
                style={{ top: '10%', left: '50%' }}
                animate={{
                    x: ['0vw', '-40vw', '20vw'],
                    y: ['0vh', '50vh', '5vh'],
                    rotate: [-5, 20, -5],
                }}
                transition={{
                    duration: 55,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 15,
                }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-lg scale-110"></div>

                    <svg width="65" height="65" viewBox="0 0 65 65" fill="none">
                        <g opacity="0.68">
                            <path
                                d="M32.5 5 L57 32.5 L32.5 57 L8 32.5 Z"
                                fill="url(#kiteGradient3)"
                                stroke="#FFD700"
                                strokeWidth="2"
                                filter="url(#shadow)"
                            />
                            <line x1="32.5" y1="5" x2="32.5" y2="57" stroke="#FFD700" strokeWidth="0.7" opacity="0.6" />
                            <line x1="8" y1="32.5" x2="57" y2="32.5" stroke="#FFD700" strokeWidth="0.7" opacity="0.6" />
                        </g>
                        <defs>
                            <linearGradient id="kiteGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.52" />
                                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.38" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <motion.svg
                        width="2"
                        height="160"
                        viewBox="0 0 2 160"
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '65px' }}
                    >
                        <motion.path
                            d="M1 0 Q4 40 1 80 Q-2 120 1 160"
                            stroke="#FFD700"
                            strokeWidth="2"
                            fill="none"
                            opacity="0.6"
                            animate={{
                                d: [
                                    'M1 0 Q4 40 1 80 Q-2 120 1 160',
                                    'M1 0 Q-2 40 1 80 Q4 120 1 160',
                                    'M1 0 Q4 40 1 80 Q-2 120 1 160',
                                ],
                            }}
                            transition={{
                                duration: 3.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.svg>
                </div>
            </motion.div>

            {/* Enhanced Animated Kite 4 - Smallest with bounce */}
            <motion.div
                className="absolute"
                style={{ top: '40%', left: '85%' }}
                animate={{
                    x: ['-5vw', '-70vw', '-10vw'],
                    y: ['-5vh', '30vh', '0vh'],
                    rotate: [5, -25, 5],
                }}
                transition={{
                    duration: 65,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 25,
                }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-200/15 rounded-full blur-md"></div>

                    <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
                        <g opacity="0.62">
                            <path
                                d="M27.5 4 L48 27.5 L27.5 48 L7 27.5 Z"
                                fill="url(#kiteGradient4)"
                                stroke="#FFD700"
                                strokeWidth="1.9"
                                filter="url(#shadow)"
                            />
                            <line x1="27.5" y1="4" x2="27.5" y2="48" stroke="#FFD700" strokeWidth="0.6" opacity="0.55" />
                            <line x1="7" y1="27.5" x2="48" y2="27.5" stroke="#FFD700" strokeWidth="0.6" opacity="0.55" />
                        </g>
                        <defs>
                            <linearGradient id="kiteGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFED4E" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#E6C200" stopOpacity="0.32" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <motion.svg
                        width="1.8"
                        height="130"
                        viewBox="0 0 1.8 130"
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '55px' }}
                    >
                        <motion.path
                            d="M0.9 0 Q3.5 32.5 0.9 65 Q-1.7 97.5 0.9 130"
                            stroke="#FFD700"
                            strokeWidth="1.8"
                            fill="none"
                            opacity="0.55"
                            animate={{
                                d: [
                                    'M0.9 0 Q3.5 32.5 0.9 65 Q-1.7 97.5 0.9 130',
                                    'M0.9 0 Q-1.7 32.5 0.9 65 Q3.5 97.5 0.9 130',
                                    'M0.9 0 Q3.5 32.5 0.9 65 Q-1.7 97.5 0.9 130',
                                ],
                            }}
                            transition={{
                                duration: 3.2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.svg>
                </div>
            </motion.div>

            {/* Bonus: Floating Chain Logos in corners */}
            <motion.div
                className="absolute top-10 right-10"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 40, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-blue-300/30"></div>
            </motion.div>

            <motion.div
                className="absolute bottom-10 left-10"
                animate={{ rotate: -360, scale: [1, 1.08, 1] }}
                transition={{ rotate: { duration: 45, repeat: Infinity, ease: 'linear' }, scale: { duration: 3.5, repeat: Infinity } }}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-300/30"></div>
            </motion.div>
        </div>
    );
}