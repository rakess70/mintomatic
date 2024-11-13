// app\WalletProviderWrapper.tsx

"use client";

import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Set up Solana Adapter with Phantom and Solflare
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Use your Reown Cloud project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Optional metadata for AppKit
const metadata = {
  name: 'Mintomatic',
  description: 'Mintomatic NFT Platform',
  url: 'https://yourdomain.com',
  icons: ['https://example.com/icon.png'],
};

// Initialize AppKit outside the component to prevent rerenders
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  },
});

export default function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
