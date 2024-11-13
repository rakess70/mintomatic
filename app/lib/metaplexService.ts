// app/lib/metaplexService.ts

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { mplCandyMachine, fetchCandyMachine, fetchCandyGuard } from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

// Initialize Umi instance with plugins for Candy Machine and Token Metadata
const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com")
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
    // console.log("Candy Machine Data:", candyMachine);

    if (!candyMachine) {
      console.error("Candy Machine not found at the provided address.");
      return null;
    }

    let collectionImage = "";
    let collectionName = "";
    let price = 20; // Default price as a fallback
    let currency = "SOLana"; // Default currency as a fallback

    // Fetch the Digital Asset metadata for the collection mint if available
    if (candyMachine.collectionMint) {
      try {
        const digitalAsset = await fetchDigitalAsset(umi, candyMachine.collectionMint);
        // console.log("Digital Asset:", digitalAsset);

        // Ensure the digitalAsset has metadata with a URI to fetch further details
        if (digitalAsset.metadata.uri) {
          const response = await fetch(digitalAsset.metadata.uri);
          if (response.ok) {
            const metadataJson = await response.json();
            // console.log("Metadata JSON:", metadataJson);
            collectionImage = metadataJson.image || "";
            collectionName = metadataJson.name || "";
          } else {
            console.warn(`Failed to fetch metadata JSON. Response status: ${response.status}`);
          }
        } else {
          console.warn("Invalid or missing URI in collection mint metadata.");
        }
      } catch (error) {
        console.error("Error fetching collection metadata using fetchDigitalAsset:", error);
      }
    } else {
      console.warn("No collection mint address found in the Candy Machine data.");
    }

    // Fetch associated Candy Guard for payment details
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

    if (candyGuard?.guards.tokenPayment?.__option === "Some" && candyGuard.guards.tokenPayment.value) {
      const tokenPayment = candyGuard.guards.tokenPayment.value;
      if (hasAmount(tokenPayment)) {
        price = Number(tokenPayment.amount) / 1_000_000; // Assuming USDC with 6 decimals
        currency = "USDC";
      } else {
        console.warn("tokenPayment guard does not contain a valid amount.");
      }
    } else if (candyGuard?.guards.solPayment?.__option === "Some" && candyGuard.guards.solPayment.value) {
      const solPayment = candyGuard.guards.solPayment.value;
      if (hasAmount(solPayment)) {
        price = Number(solPayment.amount) / 1_000_000_000;
        currency = "SOL";
      } else {
        console.warn("solPayment guard does not contain a valid amount.");
      }
    } else {
      console.warn("No valid payment guard found in the Candy Guard data.");
    }

    return {
      collectionImage: collectionImage || null,
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

/**
 * Fetches the transaction cost based on the given transaction ID.
 * @param txId - The transaction ID in base58 format.
 * @returns The cost of the transaction in SOL.
 */
export async function fetchTransactionCost(txId: string): Promise<number> {
  try {
    // Convert the base58 transaction ID string to Uint8Array
    const txIdUint8Array = base58.serialize(txId);

    // Fetch the transaction using the Uint8Array version of txId
    const transaction = await umi.rpc.getTransaction(txIdUint8Array);
    if (!transaction || !transaction.meta) throw new Error("Transaction not found");

    // Calculate the cost of the transaction (includes fees)
    const costInLamports = Number(transaction.meta.fee);
    return costInLamports / 1e9; // Convert from lamports to SOL
  } catch (error) {
    console.error("Failed to fetch transaction cost:", error);
    return 0;
  }
}

/**
 * Fetches NFT metadata using its mint address.
 * @param mintAddress - The mint address of the NFT.
 * @returns The metadata JSON of the NFT.
 */
export async function fetchNFTMetadata(mintAddress: string) {
  try {
    const mintPubkey = publicKey(mintAddress);

    const metadata = await fetchDigitalAsset(umi, mintPubkey);

    // Fetch metadata JSON from the URI


    if (metadata?.metadata?.uri) {
      const response = await fetch(metadata.metadata.uri);
      return await response.json();
    }
    console.warn("Metadata URI is missing for the NFT mint address.");
    return null;
  } catch (error) {
    console.error("Failed to fetch NFT metadata:", error);
    return null;
  }

}