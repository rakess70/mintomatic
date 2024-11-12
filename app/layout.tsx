// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProviderWrapper from "./WalletProviderWrapper";

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
        {/* Wrap children in WalletProviderWrapper for client-side wallet functionality */}
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </body>
    </html>
  );
}
