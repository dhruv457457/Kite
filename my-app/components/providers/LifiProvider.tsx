'use client';

import { createConfig } from '@lifi/sdk';
import { ReactNode, useEffect } from 'react';

export function LifiProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    createConfig({
      integrator: 'Kite',
      apiKey: process.env.NEXT_PUBLIC_LIFI_API_KEY,
    });
  }, []);

  return <>{children}</>;
}