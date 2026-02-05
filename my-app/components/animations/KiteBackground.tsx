'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function KiteBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {/* Animated Kite */}
            <motion.div
                className="absolute"
                style={{ top: '20%', left: '10%' }}
                animate={{
                    x: ['0vw', '80vw', '10vw'],
                    y: ['0vh', '60vh', '10vh'],
                    rotate: [0, 20, -10, 0],
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Kite Diamond Shape */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Main kite body */}
                    <g opacity="0.3">
                        <path
                            d="M40 5 L70 40 L40 70 L10 40 Z"
                            fill="url(#kiteGradient)"
                            stroke="#FFD700"
                            strokeWidth="1"
                        />
                        {/* Center line (vertical) */}
                        <line x1="40" y1="5" x2="40" y2="70" stroke="#FFD700" strokeWidth="0.5" opacity="0.6" />
                        {/* Center line (horizontal) */}
                        <line x1="10" y1="40" x2="70" y2="40" stroke="#FFD700" strokeWidth="0.5" opacity="0.6" />
                    </g>

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="kiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#E6C200" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Trailing String with swaying animation */}
                <motion.svg
                    width="2"
                    height="200"
                    viewBox="0 0 2 200"
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: '80px' }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M1 0 Q5 50 1 100 Q-3 150 1 200"
                        stroke="#FFD700"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.3"
                        animate={{
                            d: [
                                'M1 0 Q5 50 1 100 Q-3 150 1 200',
                                'M1 0 Q-3 50 1 100 Q5 150 1 200',
                                'M1 0 Q5 50 1 100 Q-3 150 1 200',
                            ],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Tail ribbons */}
                    <motion.g
                        animate={{
                            x: [-2, 2, -2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <circle cx="1" cy="170" r="3" fill="#FFD700" opacity="0.4" />
                        <circle cx="1" cy="185" r="2.5" fill="#FFD700" opacity="0.3" />
                        <circle cx="1" cy="197" r="2" fill="#FFD700" opacity="0.2" />
                    </motion.g>
                </motion.svg>
            </motion.div>

            {/* Second Kite (smaller, different path) */}
            <motion.div
                className="absolute"
                style={{ top: '60%', left: '70%' }}
                animate={{
                    x: ['-10vw', '-60vw', '-5vw'],
                    y: ['-10vh', '20vh', '-5vh'],
                    rotate: [10, -15, 10],
                }}
                transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 5,
                }}
            >
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.25">
                        <path
                            d="M30 5 L52 30 L30 52 L8 30 Z"
                            fill="url(#kiteGradient2)"
                            stroke="#FFD700"
                            strokeWidth="0.8"
                        />
                        <line x1="30" y1="5" x2="30" y2="52" stroke="#FFD700" strokeWidth="0.4" opacity="0.5" />
                        <line x1="8" y1="30" x2="52" y2="30" stroke="#FFD700" strokeWidth="0.4" opacity="0.5" />
                    </g>

                    <defs>
                        <linearGradient id="kiteGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFED4E" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                </svg>

                <motion.svg
                    width="1.5"
                    height="150"
                    viewBox="0 0 1.5 150"
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: '60px' }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M0.75 0 Q4 40 0.75 80 Q-2 120 0.75 150"
                        stroke="#FFD700"
                        strokeWidth="0.8"
                        fill="none"
                        opacity="0.25"
                        animate={{
                            d: [
                                'M0.75 0 Q4 40 0.75 80 Q-2 120 0.75 150',
                                'M0.75 0 Q-2 40 0.75 80 Q4 120 0.75 150',
                                'M0.75 0 Q4 40 0.75 80 Q-2 120 0.75 150',
                            ],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.svg>
            </motion.div>
        </div>
    );
}
