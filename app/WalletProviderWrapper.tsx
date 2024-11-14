"use client";

import React, { useMemo } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"; // Import the network enum

// Access environment variables
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Map string `network` to `WalletAdapterNetwork` enum
const walletAdapterNetwork = network === "mainnet-beta"
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet; // Maps to devnet or mainnet

// Map the Solana network to the correct configuration with RPC
const solanaNetwork = network === "mainnet-beta"
  ? { ...solana, rpcUrl }
  : { ...solanaDevnet, rpcUrl };

// Configure WalletConnect with the correct Solana network settings
const walletConnectAdapter = new WalletConnectWalletAdapter({
  network: walletAdapterNetwork, // Use WalletAdapterNetwork enum
  options: {
    projectId,
    relayUrl: "wss://relay.walletconnect.com",
    metadata: {
      name: "Mintomatic",
      description: "Mintomatic NFT Platform",
      url: "https://yourdomain.com",
      icons: ["https://example.com/icon.png"],
    },
  },
});

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [walletConnectAdapter, new SolflareWalletAdapter()],
});

// Initialize AppKit outside the component to prevent rerenders
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solanaNetwork], // Use the dynamically mapped solanaNetwork
  metadata: {
    name: "Mintomatic",
    description: "Mintomatic NFT Platform",
    url: "https://yourdomain.com",
    icons: ["https://example.com/icon.png"],
  },
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
