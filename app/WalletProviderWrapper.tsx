"use client";

import React, { useMemo } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";

// Access environment variables
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Map the network to the correct Solana network configuration
const solanaNetwork =
  network === "mainnet-beta" ? solana :
  network === "testnet" ? solanaTestnet :
  solanaDevnet; // Defaults to devnet

// Set up the Solana Adapter with supported wallets
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

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
  networks: [solanaNetwork],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  },
});

// Component Function
export default function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => rpcUrl, [rpcUrl]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={solanaWeb3JsAdapter.wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
