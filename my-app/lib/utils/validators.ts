/**
 * Validation Utility Functions
 */

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns true if valid Ethereum address format
 */
export function isValidAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;

    // Must start with 0x and be 42 characters long (0x + 40 hex chars)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;

    return true;
}

/**
 * Validates if a name is a valid ENS name
 * @param name - The name to validate
 * @returns true if valid ENS name format
 */
export function isValidENSName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    const trimmed = name.trim().toLowerCase();

    // Must end with .eth
    if (!trimmed.endsWith('.eth')) return false;

    // Must have at least one character before .eth
    if (trimmed === '.eth') return false;

    // Check for valid characters (alphanumeric, hyphens, and dots)
    const validPattern = /^[a-z0-9.-]+\.eth$/;
    if (!validPattern.test(trimmed)) return false;

    // Should not start or end with hyphen or dot
    const parts = trimmed.split('.');
    for (const part of parts) {
        if (part.startsWith('-') || part.endsWith('-')) return false;
        if (part === '') return false;
    }

    return true;
}

/**
 * Validates if a string is a valid token amount
 * @param amount - The amount to validate
 * @returns true if valid positive number
 */
export function isValidAmount(amount: string): boolean {
    if (!amount || typeof amount !== 'string') return false;

    const trimmed = amount.trim();

    // Must be a valid number
    if (!/^\d+\.?\d*$/.test(trimmed)) return false;

    const num = parseFloat(trimmed);

    // Must be positive and not NaN
    if (isNaN(num) || num <= 0) return false;

    return true;
}

/**
 * Checks if an amount exceeds a balance
 * @param amount - The amount to send
 * @param balance - The available balance
 * @returns true if amount exceeds balance
 */
export function exceedsBalance(amount: string, balance: string): boolean {
    if (!isValidAmount(amount)) return false;
    if (!balance || typeof balance !== 'string') return true;

    try {
        const amountNum = parseFloat(amount);
        const balanceNum = parseFloat(balance);

        if (isNaN(amountNum) || isNaN(balanceNum)) return true;

        return amountNum > balanceNum;
    } catch {
        return true;
    }
}

/**
 * Validates if a slippage value is acceptable
 * @param slippage - The slippage percentage (e.g., 0.5 for 0.5%)
 * @returns true if valid slippage between 0.1% and 50%
 */
export function isValidSlippage(slippage: number): boolean {
    if (typeof slippage !== 'number' || isNaN(slippage)) return false;

    return slippage >= 0.1 && slippage <= 50;
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove < > characters to prevent XSS
    return input.replace(/[<>]/g, '');
}

/**
 * Validates if a string is a valid URL
 * @param url - The URL to validate
 * @returns true if valid URL format
 */
export function isValidURL(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validates if a transaction hash is valid
 * @param hash - The transaction hash to validate
 * @returns true if valid tx hash format
 */
export function isValidTxHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') return false;

    // Must start with 0x and be 66 characters long (0x + 64 hex chars)
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validates if a chain ID is a valid number
 * @param chainId - The chain ID to validate
 * @returns true if valid chain ID
 */
export function isValidChainId(chainId: number): boolean {
    return typeof chainId === 'number' && chainId > 0 && Number.isInteger(chainId);
}
