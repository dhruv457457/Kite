import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                // Cyber-Minimalist Palette
                'cyber-yellow': '#FFD700',
                'cyber-yellow-dark': '#E6C200',
                'cyber-yellow-light': '#FFED4E',
                'charcoal': '#18181B',
                'slate': '#71717A',
                'light-grey': '#F4F4F5',
                'crisp-white': '#FAFAFA',
                'silver': '#E4E4E7',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
                'yellow-glow': '0 0 20px rgba(255, 215, 0, 0.2)',
            },
            borderWidth: {
                '0.5': '0.5px',
            },
        },
    },
    plugins: [],
};

export default config;