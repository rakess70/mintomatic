// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ConnectButton from "./components/ConnectButton";
import { fetchCandyMachineData } from "./lib/metaplexService";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
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
    description: "Crossmint and Affiliate Integrated",
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
          <div className="top-bar">
            <ConnectButton />
          </div>
          {children}
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
