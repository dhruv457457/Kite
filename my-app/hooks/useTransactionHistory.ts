import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionStatus, TransactionHashes } from '@/types/transaction';

const STORAGE_KEY = 'kite_transaction_history';
const MAX_TRANSACTIONS = 50;

interface UseTransactionHistoryResult {
    transactions: Transaction[];
    addTransaction: (transaction: Transaction) => void;
    getTransactions: () => Transaction[];
    getTransactionById: (id: string) => Transaction | null;
    updateTransactionStatus: (
        id: string,
        status: TransactionStatus,
        txHashes?: Partial<TransactionHashes>
    ) => void;
    clearHistory: () => void;
}

/**
 * Hook to manage transaction history using localStorage
 * @returns Functions and state for managing transaction history
 */
export default function useTransactionHistory(): UseTransactionHistoryResult {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Load transactions from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Transaction[];
                // Sort by timestamp descending (newest first)
                const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
                setTransactions(sorted);
            }
        } catch (error) {
            console.error('Failed to load transaction history:', error);
            setTransactions([]);
        }
    }, []);

    // Save transactions to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error('Failed to save transaction history:', error);
        }
    }, [transactions]);

    /**
     * Add a new transaction to history
     */
    const addTransaction = useCallback((transaction: Transaction) => {
        setTransactions((prev) => {
            // Add new transaction at the beginning
            const updated = [transaction, ...prev];

            // Keep only the last MAX_TRANSACTIONS
            if (updated.length > MAX_TRANSACTIONS) {
                updated.splice(MAX_TRANSACTIONS);
            }

            return updated;
        });
    }, []);

    /**
     * Get all transactions sorted by timestamp
     */
    const getTransactions = useCallback((): Transaction[] => {
        return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    }, [transactions]);

    /**
     * Get a specific transaction by ID
     */
    const getTransactionById = useCallback(
        (id: string): Transaction | null => {
            return transactions.find((tx) => tx.id === id) || null;
        },
        [transactions]
    );

    /**
     * Update transaction status and optionally add transaction hashes
     */
    const updateTransactionStatus = useCallback(
        (
            id: string,
            status: TransactionStatus,
            txHashes?: Partial<TransactionHashes>
        ) => {
            setTransactions((prev) => {
                return prev.map((tx) => {
                    if (tx.id === id) {
                        return {
                            ...tx,
                            status,
                            txHashes: {
                                ...tx.txHashes,
                                ...txHashes,
                            },
                        };
                    }
                    return tx;
                });
            });
        },
        []
    );

    /**
     * Clear all transaction history
     */
    const clearHistory = useCallback(() => {
        setTransactions([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear transaction history:', error);
        }
    }, []);

    return {
        transactions,
        addTransaction,
        getTransactions,
        getTransactionById,
        updateTransactionStatus,
        clearHistory,
    };
}
