// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ConnectButton from "./components/ConnectButton";  // Import ConnectButton

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Number Forty-Seven Minting Button",
  description: "Crossmint and Affiliate Integrated",
};

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
          <ConnectButton />  {/* Add the ConnectButton here */}
          {children}
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
