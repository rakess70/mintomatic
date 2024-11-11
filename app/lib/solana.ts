import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, Nft, candyMachineModule } from "@metaplex-foundation/js";

// Create a connection using the network from the environment variable
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com");

// Initialize Metaplex
const metaplex = Metaplex.make(connection).use(candyMachineModule());

// This is the USDC mint address on Solana
const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Type guard to check if an object has the "basisPoints" property
function hasBasisPoints(amount: any): amount is { basisPoints: { toNumber: () => number } } {
  return typeof amount === "object" && amount !== null && "basisPoints" in amount;
}

/**
 * Fetches the metadata for an NFT using its mint address.
 * @param mintAddress - The mint address of the NFT.
 * @returns The metadata of the NFT.
 */
export async function fetchNFTMetadata(mintAddress: string) {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });

    const metadataUri = nft.uri;
    const response = await fetch(metadataUri);
    const nftData = await response.json();

    return nftData;
  } catch (error) {
    console.error("Failed to fetch NFT metadata:", error);
    return null;
  }
}

/**
 * Fetches the Candy Machine details and collection metadata.
 * @param candyMachineId - The ID of the Candy Machine.
 * @param connection - The Solana connection object.
 * @returns The Candy Machine data including collection details and price.
 */
export async function fetchCandyMachineData(candyMachineId: string, connection: Connection) {
  try {
    const metaplex = Metaplex.make(connection).use(candyMachineModule());
    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineId),
    });

    console.log("Full Candy Machine Data:", JSON.stringify(candyMachine, null, 2));

    let collectionImage = "";
    let collectionName = "";
    let price = 0;
    let currency = "SOL"; // Default to SOL

    // Fetch the collection metadata if available
    if (candyMachine.collectionMintAddress) {
      try {
        const collectionNft = await metaplex.nfts().findByMint({
          mintAddress: new PublicKey(candyMachine.collectionMintAddress),
        });

        const collectionUri = collectionNft.uri;
        const response = await fetch(collectionUri);
        const metadata = await response.json();
        collectionImage = metadata.image || "";
        collectionName = metadata.name || "";
      } catch (error) {
        console.error("Error fetching collection metadata:", error);
      }
    }

    // Log the candyGuard structure specifically
    console.log("Candy Guard Structure:", JSON.stringify(candyMachine.candyGuard, null, 2));

    // Check for token payment guard
    if (candyMachine.candyGuard?.guards?.tokenPayment) {
      const tokenPaymentGuard = candyMachine.candyGuard.guards.tokenPayment;
      console.log("Token Payment Guard Data:", JSON.stringify(tokenPaymentGuard, null, 2));

      // Calculate the price in USDC (since USDC uses 6 decimals)
      const amountInNumber =
        typeof tokenPaymentGuard.amount === "number"
          ? tokenPaymentGuard.amount
          : tokenPaymentGuard.amount.basisPoints?.toNumber() || 0;
      
      price = amountInNumber / 1_000_000;
      currency = "USDC";
    } else if (candyMachine.candyGuard?.guards?.solPayment) {
      // Fallback to SOL payment if available
      price = candyMachine.candyGuard.guards.solPayment.amount.basisPoints.toNumber() / 1_000_000_000;
      currency = "SOL";
    } else {
      console.warn("No valid payment guard found.");
    }

    return {
      collectionImage,
      collectionName,
      itemsAvailable: candyMachine.itemsAvailable.toNumber(),
      itemsMinted: candyMachine.itemsMinted.toNumber(),
      itemsRemaining: candyMachine.itemsAvailable.toNumber() - candyMachine.itemsMinted.toNumber(),
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
 * @param txId - The transaction ID.
 * @returns The cost of the transaction in SOL.
 */
export async function fetchTransactionCost(txId: string): Promise<number> {
  try {
    const transaction = await connection.getConfirmedTransaction(txId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Calculate the cost of the transaction (includes fees)
    const costInLamports = transaction.meta?.fee || 0;
    return costInLamports / 1e9; // Convert from lamports to SOL
  } catch (error) {
    console.error("Failed to fetch transaction cost:", error);
    return 0;
  }
}
