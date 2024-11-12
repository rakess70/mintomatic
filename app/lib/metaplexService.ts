// app/lib/metaplexService.ts

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplCandyMachine, fetchCandyMachine, fetchCandyGuard } from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";

// Initialize Umi instance with plugins for Candy Machine and Token Metadata
const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com")
  .use(mplTokenMetadata())
  .use(mplCandyMachine());

/**
 * Type guard to check if an object has the "amount" property.
 */
function hasAmount<T>(guard: T | null): guard is T & { amount: bigint } {
  return guard !== null && typeof (guard as any).amount === "bigint";
}

/**
 * Fetches Candy Machine data along with its collection metadata and guard settings.
 * @param candyMachineId - The ID of the Candy Machine.
 * @returns Candy Machine data including collection details and price.
 */
export async function fetchCandyMachineData(candyMachineId: string) {
  try {
    const candyMachineAddress = publicKey(candyMachineId);

    // Fetch Candy Machine data
    const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

    let collectionImage = "";
    let collectionName = "";
    let price = 0;
    let currency = "SOL"; // Default currency is SOL

    // Fetch Collection Metadata if available
    if (candyMachine.collectionMint) {
      const metadata = await fetchMetadata(umi, candyMachine.collectionMint);
      if (metadata.uri) {
        const response = await fetch(metadata.uri);
        const metadataJson = await response.json();

        collectionImage = metadataJson.image || "";
        collectionName = metadataJson.name || "";
      }
    }

    // Fetch associated Candy Guard for payment details
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

    // Safely access solPayment and tokenPayment if they exist and have an amount property
    if (candyGuard?.guards.solPayment && hasAmount(candyGuard.guards.solPayment)) {
      price = Number(candyGuard.guards.solPayment.amount) / 1_000_000_000;
      currency = "SOL";
    } else if (candyGuard?.guards.tokenPayment && hasAmount(candyGuard.guards.tokenPayment)) {
      price = Number(candyGuard.guards.tokenPayment.amount) / 1_000_000; // Assuming USDC with 6 decimals
      currency = "USDC";
    }

    return {
      collectionImage,
      collectionName,
      itemsAvailable: Number(candyMachine.data.itemsAvailable),
      itemsMinted: Number(candyMachine.itemsRedeemed),
      itemsRemaining: Number(candyMachine.data.itemsAvailable) - Number(candyMachine.itemsRedeemed),
      price,
      currency,
    };
  } catch (error) {
    console.error("Failed to fetch Candy Machine data:", error);
    return null;
  }
}
