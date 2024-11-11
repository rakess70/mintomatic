// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import Solana wallet adapter and supporting libraries
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css'; // Styles for the wallet adapter UI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Minting Button",
  description: "Mintomatic and Affiliate Integrated",
};

// Set up the network and endpoint
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

// Define supported wallets (e.g., Phantom)
const wallets = [new PhantomWalletAdapter()];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        {/* Wrap the application in the Solana connection and wallet providers */}
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
