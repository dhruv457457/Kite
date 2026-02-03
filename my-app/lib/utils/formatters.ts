/**
 * Formatting Utility Functions
 */

/**
 * Shortens an Ethereum address to format: 0x1234...5678
 * @param address - The full address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address
 */
export function formatAddress(
    address: string,
    startChars: number = 6,
    endChars: number = 4
): string {
    if (!address || typeof address !== 'string') return '';

    if (address.length <= startChars + endChars) return address;

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Converts wei/raw token amount to human-readable format
 * @param amount - The amount in wei (string or number)
 * @param decimals - Token decimals (default: 18)
 * @param displayDecimals - Number of decimals to display (default: 4)
 * @returns Formatted token amount
 */
export function formatTokenAmount(
    amount: string | number | bigint,
    decimals: number = 18,
    displayDecimals: number = 4
): string {
    if (amount === null || amount === undefined) return '0';

    try {
        const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount.toString());
        const divisor = BigInt(10 ** decimals);
        const wholePart = amountBigInt / divisor;
        const fractionalPart = amountBigInt % divisor;

        // Convert fractional part to decimal
        const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        const decimalValue = parseFloat(`${wholePart}.${fractionalStr}`);

        // Format with specified decimals and remove trailing zeros
        const formatted = decimalValue.toFixed(displayDecimals);
        return parseFloat(formatted).toString();
    } catch {
        return '0';
    }
}

/**
 * Formats a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted USD string (e.g., $1,234.56)
 */
export function formatUSD(amount: string | number): string {
    if (amount === null || amount === undefined) return '$0.00';

    try {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(num)) return '$0.00';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return '$0.00';
    }
}

/**
 * Formats a number as a percentage
 * @param value - The value to format (e.g., 0.5 for 0.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., 1.23%)
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '0%';

    return `${value.toFixed(decimals)}%`;
}

/**
 * Converts seconds to human-readable duration
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "30s", "2m 30s", "1h 15m")
 */
export function formatDuration(seconds: number): string {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
        return '0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

/**
 * Formats a timestamp to readable date
 * @param timestamp - Unix timestamp in seconds or milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
    if (!timestamp || isNaN(timestamp)) return '';

    try {
        // Handle both seconds and milliseconds
        const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return '';
    }
}

/**
 * Capitalizes chain names properly
 * @param chainName - The chain name to format
 * @returns Properly capitalized chain name
 */
export function formatChainName(chainName: string): string {
    if (!chainName || typeof chainName !== 'string') return '';

    const normalized = chainName.toLowerCase().trim();

    // Special cases
    const specialCases: Record<string, string> = {
        ethereum: 'Ethereum',
        base: 'Base',
        arbitrum: 'Arbitrum',
        polygon: 'Polygon',
        optimism: 'Optimism',
        bnb: 'BNB Chain',
        avalanche: 'Avalanche',
    };

    return specialCases[normalized] || chainName.charAt(0).toUpperCase() + chainName.slice(1);
}

/**
 * Parses user input token amount to wei
 * @param amount - The amount string from user input
 * @param decimals - Token decimals (default: 18)
 * @returns Amount in wei as bigint
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
    if (!amount || typeof amount !== 'string') return BigInt(0);

    try {
        const trimmed = amount.trim();

        // Split into whole and fractional parts
        const [whole = '0', fractional = ''] = trimmed.split('.');

        // Pad or truncate fractional part to match decimals
        const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);

        // Combine and convert to bigint
        const combined = whole + paddedFractional;
        return BigInt(combined);
    } catch {
        return BigInt(0);
    }
}

/**
 * Truncates text with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
    if (!text || typeof text !== 'string') return '';

    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a number with commas for thousands
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | string): string {
    if (num === null || num === undefined) return '0';

    try {
        const parsed = typeof num === 'string' ? parseFloat(num) : num;

        if (isNaN(parsed)) return '0';

        return new Intl.NumberFormat('en-US').format(parsed);
    } catch {
        return '0';
    }
}
