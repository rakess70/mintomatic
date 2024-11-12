"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { fetchCandyMachineData } from "./lib/candyMachine";

export default function Home() {
  const [referralID, setReferralID] = useState<string | null>(null);
  const [candyMachineData, setCandyMachineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string>("");

  const projectId = process.env.NEXT_PUBLIC_CROSSMINT_PROJECT_ID as string;
  const collectionId = process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID as string;
  const environment = process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT as string;
  const candyMachineId = process.env.NEXT_PUBLIC_SOLANA_CANDY_MACHINE_ID as string;
  const solanaRpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com"; // Default fallback RPC

  // Default referral code from environment variable
  const defaultReferralCode = process.env.NEXT_PUBLIC_REFERRAL_RADIUS_DEFAULT_CODE || 'DEFAULT-REFERRAL-CODE'; // Use a sensible default if not set

  useEffect(() => {
    // Dynamically determine the base URL from the window object
    const urlString = new URL(window.location.href);
    
    // Get the referral code from the URL if provided
    const referral = urlString.searchParams.get("rr");

    // Set referralID to either the provided referral or the default one
    setReferralID(referral || defaultReferralCode);

    const baseUrl = `${window.location.protocol}//${window.location.host}/`;
    setBaseUrl(baseUrl);

    // Use the custom RPC connection
    const connection = new Connection(solanaRpc);

    // Fetch Candy Machine Data
    const fetchData = async () => {
      try {
        const data = await fetchCandyMachineData(candyMachineId, connection);
        console.log("Fetched Candy Machine Data on Mint Page:", data); // Log the fetched data for debugging
        setCandyMachineData(data);
      } catch (error) {
        console.error("Failed to fetch Candy Machine data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candyMachineId, solanaRpc, defaultReferralCode]);

  // Use dynamically determined baseUrl
  const successString = `${baseUrl}success`;
  const failString = `${baseUrl}failure`;

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (!candyMachineData) {
    return <p className="text-center text-white">Failed to load Candy Machine data.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="max-w-[500px] w-full px-6 py-12 text-center">
        {/* Header Section */}
        <h1 className="text-3xl font-bold text-white">
          Mint Your {candyMachineData.collectionName} NFT
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Join the exclusive collection of {candyMachineData.itemsAvailable} unique NFTs!
        </p>
        <div className="mt-4 flex justify-center">
          <img
            src={candyMachineData.collectionImage || ""}
            alt={candyMachineData.collectionName}
            className="w-64 h-64 object-cover rounded-lg"
          />
        </div>

        {/* Minting Section */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-xl font-semibold text-white">
            Remaining Supply: {candyMachineData.itemsRemaining} / {candyMachineData.itemsAvailable}
          </p>
          <p className="mt-2 text-lg text-gray-300">
            Price: {candyMachineData.price} {candyMachineData.currency} + minting fees
          </p>
          <div className="mt-6">
            // mint button
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 text-gray-400 text-sm">
          Securely mint your NFT directly to your wallet.
        </div>
      </div>
    </div>
  );
}
