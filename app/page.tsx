"use client";

import { useEffect, useState } from "react";
import { fetchCandyMachineData } from "./lib/metaplexService";
import WalletStatus from "./components/WalletStatus";
import CreditCardMint from "./components/CreditCardMint";

export default function Home() {
  const [candyMachineData, setCandyMachineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mintMethod, setMintMethod] = useState<"wallet" | "credit-card">("wallet");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const candyMachineId = process.env.NEXT_PUBLIC_SOLANA_CANDY_MACHINE_ID as string;

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

    fetchData();
  }, [candyMachineId]);

  // Function to update wallet connection status and address
  const handleWalletConnectionChange = (connected: boolean, walletAddress: string | null) => {
    setIsWalletConnected(connected);
    setAddress(walletAddress); // Update address based on wallet connection
  };

  // Minting function
  const mintNFTWithWallet = async () => {
    if (!isWalletConnected || !address) {
      console.warn("Please connect your wallet to mint an NFT.");
      return;
    }

    setIsMinting(true);
    try {
      console.log("Attempting to mint with wallet address:", address);
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        console.log("Minting successful! Signature:", result.signature);
        setIsMinted(true);
      } else {
        console.error("Minting failed:", result.message);
      }
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (!candyMachineData) return <p className="text-center text-white">Failed to load Candy Machine data.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row p-6 bg-gray-900 rounded-lg">
        {/* Left Column */}
        <div className="md:w-1/2 md:pr-6 mb-6 md:mb-0 text-center">
          <h1 className="text-3xl font-bold mb-4">Mint Your {candyMachineData.collectionName} NFT</h1>
          <p className="text-lg text-gray-300 mb-4">
            Join the exclusive collection of {candyMachineData.itemsAvailable} unique NFTs!
          </p>
          <div className="mb-4">
            <img
              src={candyMachineData.collectionImage || ""}
              alt={candyMachineData.collectionName}
              className="w-64 h-64 object-cover rounded-lg mx-auto"
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
        <div className="md:w-1/2 md:pl-6">
          {/* Tab Navigation */}
          <div className="flex mb-4 border-b border-gray-600">
            <button
              className={`flex-1 py-2 ${mintMethod === "wallet" ? "border-b-2 border-white" : "text-gray-400"}`}
              onClick={() => setMintMethod("wallet")}
            >
              Mint with Wallet
            </button>
            <button
              className={`flex-1 py-2 ${mintMethod === "credit-card" ? "border-b-2 border-white" : "text-gray-400"}`}
              onClick={() => setMintMethod("credit-card")}
            >
              Mint with Credit Card
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            {mintMethod === "wallet" && (
              <div className="wallet-minting">
                <WalletStatus onConnectionChange={handleWalletConnectionChange} label="Connect Wallet" />
                {isWalletConnected ? (
                  <button
                    onClick={mintNFTWithWallet}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={isMinting}
                  >
                    {isMinting ? "Minting..." : isMinted ? "Minted!" : "Mint NFT with Wallet"}
                  </button>
                ) : (
                  <p className="text-gray-400">Please connect your wallet to mint with Solana.</p>
                )}
              </div>
            )}

            {mintMethod === "credit-card" && (
              <div className="credit-card-minting">
                <WalletStatus onConnectionChange={handleWalletConnectionChange} label="Connect Wallet (optional)" />
                <div className="mt-6"><CreditCardMint /></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}