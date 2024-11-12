// app\lib\solana.ts

import { fetchNFTMetadata, fetchCandyMachineData, fetchTransactionCost } from "./metaplexService";

/**
 * Fetch NFT metadata by its mint address.
 */
export async function getNFTMetadata(mintAddress: string) {
  return await fetchNFTMetadata(mintAddress);
}

/**
 * Fetch Candy Machine data along with collection metadata.
 */
export async function getCandyMachineData(candyMachineId: string) {
  return await fetchCandyMachineData(candyMachineId);
}

/**
 * Fetch transaction cost for a given transaction ID.
 */
export async function getTransactionCost(txId: string): Promise<number> {
  return await fetchTransactionCost(txId);
}
