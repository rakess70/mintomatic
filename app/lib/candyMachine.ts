import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, candyMachineModule } from "@metaplex-foundation/js";

// Create a connection
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com");


// Function to fetch Candy Machine details and collection metadata
export async function fetchCandyMachineData(candyMachineId: string, connection: Connection) {
  const metaplex = Metaplex.make(connection).use(candyMachineModule());
  const candyMachine = await metaplex.candyMachines().findByAddress({
    address: new PublicKey(candyMachineId),
  });

  let collectionImage = "";
  let collectionName = "";
  let price = 0;
  let currency = "SOL"; // Default to SOL

  // Check if the Candy Machine has a collection configured
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

  // Check if SOL payment is configured
  if (candyMachine.candyGuard?.guards?.solPayment) {
    price = candyMachine.candyGuard.guards.solPayment.amount.basisPoints.toNumber() / 1_000_000_000;
    currency = "SOL"; // Set currency to SOL
  } else {
    // Check for token payment (e.g., USDC) if SOL is not available
    const tokenPaymentGuard = candyMachine.candyGuard?.guards?.tokenPayment;
    if (tokenPaymentGuard) {
      price = tokenPaymentGuard.amount.basisPoints.toNumber() / 1_000_000;
      currency = "USDC"; // Set currency to USDC
    }
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
}

// Function to fetch the transaction cost
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
