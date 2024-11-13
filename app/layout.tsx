// app/layout.ts

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ConnectButton from "./components/ConnectButton";
import { fetchCandyMachineData } from "./lib/metaplexService"; // Import the data fetcher

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // Retrieve Candy Machine ID from environment variable
  const candyMachineId = process.env.NEXT_PUBLIC_SOLANA_CANDY_MACHINE_ID;
  
  if (!candyMachineId) {
    console.warn("Candy Machine ID is not defined in the environment variables.");
    return {
      title: "Minting Button",
      description: "Crossmint and Affiliate Integrated",
    };
  }

  const data = await fetchCandyMachineData(candyMachineId);

  return {
    title: data?.collectionName ? `${data.collectionName} Minting Button` : "Minting Button",
    description: "Powered by Mintomatic and Referral Radius by Bellwether Online Solutions",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <WalletProviderWrapper>
          <ConnectButton />
          {children}
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
