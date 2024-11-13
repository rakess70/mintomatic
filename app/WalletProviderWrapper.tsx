"use client";

import React, { useMemo } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"; // Import the network enum

// Environment variables
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Map string `network` to `WalletAdapterNetwork` enum
const walletAdapterNetwork = network === "mainnet-beta"
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet; // Use Mainnet or Devnet based on `network`

// Map the network to the correct Solana network configuration with RPC
const solanaNetwork = network === "mainnet-beta"
  ? { ...solana, rpcUrl }
  : network === "testnet"
  ? { ...solanaTestnet, rpcUrl }
  : { ...solanaDevnet, rpcUrl }; // default to devnet

// Set up WalletConnect for Solana with Solana Wallet Adapter
const walletConnectAdapter = new WalletConnectWalletAdapter({
  network: walletAdapterNetwork, // Use the enum value here
  options: {
    projectId, // WalletConnect project ID
    relayUrl: "wss://relay.walletconnect.com", // WalletConnect relay server
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
