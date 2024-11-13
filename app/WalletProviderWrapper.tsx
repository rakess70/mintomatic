"use client";

import React, { useMemo } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

// Set up the Solana Adapter with supported wallets
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Use your Reown Cloud project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Metadata for AppKit
const metadata = {
  name: "Mintomatic",
  description: "Mintomatic NFT Platform",
  url: "https://yourdomain.com",
  icons: ["https://example.com/icon.png"],
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

// Component Function
export default function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  // Define network endpoint for Solana
  const network = "mainnet-beta"; // Can be "mainnet-beta", "devnet", or "testnet"
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={solanaWeb3JsAdapter.wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
