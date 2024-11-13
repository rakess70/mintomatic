"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { fetchCandyMachineData } from "./lib/metaplexService";
import ConnectButton from "./components/ConnectButton";  // Import ConnectButton component
import CreditCardMint from "./components/CreditCardMint"; // Import Credit Card Mint component

export default function Home() {
  const [referralID, setReferralID] = useState<string | null>(null);
  const [candyMachineData, setCandyMachineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mintMethod, setMintMethod] = useState<'wallet' | 'credit-card'>('wallet'); // State to toggle tabs

  const candyMachineId = process.env.NEXT_PUBLIC_SOLANA_CANDY_MACHINE_ID as string;
  const solanaRpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
  const defaultReferralCode = process.env.NEXT_PUBLIC_REFERRAL_RADIUS_DEFAULT_CODE || 'DEFAULT-REFERRAL-CODE';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCandyMachineData(candyMachineId);
        setCandyMachineData(data);
      } catch (error) {
        console.error("Failed to fetch Candy Machine data:", error);
      } finally {
        setLoading(false);
      }
    };

    const urlString = new URL(window.location.href);
    const referral = urlString.searchParams.get("rr");
    setReferralID(referral || defaultReferralCode);

    fetchData();
  }, [candyMachineId, solanaRpc, defaultReferralCode]);

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (!candyMachineData) {
    return <p className="text-center text-white">Failed to load Candy Machine data.</p>;
  }

  return (
    <div className="flex flex-row min-h-screen bg-black text-white p-6">
      {/* Left Column */}
      <div className="w-1/2 pr-6">
        <h1 className="text-3xl font-bold mb-4">
          Mint Your {candyMachineData.collectionName} NFT
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          Join the exclusive collection of {candyMachineData.itemsAvailable} unique NFTs!
        </p>
        <div className="mb-4">
          <img
            src={candyMachineData.collectionImage || ""}
            alt={candyMachineData.collectionName}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        <p className="text-xl font-semibold mb-2">
          Remaining Supply: {candyMachineData.itemsRemaining} / {candyMachineData.itemsAvailable}
        </p>
        <p className="text-lg text-gray-300 mb-4">
          Price: {candyMachineData.price} {candyMachineData.currency} + minting fees
        </p>
      </div>

      {/* Right Column with Tabs */}
      <div className="w-1/2 pl-6">
        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-gray-600">
          <button
            className={`flex-1 py-2 ${mintMethod === 'wallet' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setMintMethod('wallet')}
          >
            Mint with Wallet
          </button>
          <button
            className={`flex-1 py-2 ${mintMethod === 'credit-card' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setMintMethod('credit-card')}
          >
            Mint with Credit Card
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 bg-gray-800 rounded-lg">
          {mintMethod === 'wallet' && (
            <div className="wallet-minting">
              <ConnectButton />
              <button className="mt-4 p-2 bg-blue-500 text-white rounded">
                Mint NFT with Wallet
              </button>
            </div>
          )}

          {mintMethod === 'credit-card' && (
            <div className="credit-card-minting">
              <CreditCardMint />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
