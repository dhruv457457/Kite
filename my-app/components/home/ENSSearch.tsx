'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidENSName } from '@/lib/utils/validators';

interface ENSSearchProps {
    onSearch: (ensName: string) => void;
    isLoading?: boolean;
}

export function ENSSearch({ onSearch, isLoading = false }: ENSSearchProps) {
    const [searchValue, setSearchValue] = useState('');
    const [error, setError] = useState('');

    const handleSearch = () => {
        // Clear previous error
        setError('');

        // Validate ENS name
        if (!searchValue) {
            setError('Please enter an ENS name');
            return;
        }

        const normalizedName = searchValue.toLowerCase().trim();

        if (!isValidENSName(normalizedName)) {
            setError('Invalid ENS name. Must end with .eth');
            return;
        }

        onSearch(normalizedName);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex gap-3">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Search ENS name (e.g., vitalik.eth)"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        error={error}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        className="text-lg py-4"
                    />
                </div>

                <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    size="lg"
                    className="px-8"
                >
                    Search
                </Button>
            </div>

            {/* Quick suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-zinc-500">Try:</span>
                {['vitalik.eth', 'nick.eth', 'brantly.eth'].map((name) => (
                    <button
                        key={name}
                        onClick={() => {
                            setSearchValue(name);
                            setError('');
                        }}
                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
}