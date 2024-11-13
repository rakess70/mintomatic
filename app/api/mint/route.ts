import { NextRequest, NextResponse } from 'next/server';
import { PublicKey as SolanaPublicKey } from '@solana/web3.js';
import { mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { transactionBuilder, generateSigner, PublicKey as UmiPublicKey } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

// Initialize UMI instance with necessary plugins
const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com")
  .use(mplTokenMetadata())
  .use(mplCandyMachine());

// Define the POST handler for minting
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  // Parse the JSON body
  const { walletAddress } = await req.json();
  const candyMachineId = process.env.NEXT_PUBLIC_SOLANA_CANDY_MACHINE_ID;
  const collectionMintId = process.env.NEXT_PUBLIC_COLLECTION_MINT_ID;

  if (!walletAddress || !candyMachineId || !collectionMintId) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const candyMachinePublicKey = new SolanaPublicKey(candyMachineId) as unknown as UmiPublicKey;
    const collectionMint = new SolanaPublicKey(collectionMintId) as unknown as UmiPublicKey;

    // Convert Buffer to Uint8Array
    const candyMachineSeed = Uint8Array.from(Buffer.from("candy_machine"));

    // Generate the PDA for the Candy Machine
    const candyMachinePda = await umi.eddsa.findPda(candyMachinePublicKey, [
      candyMachineSeed,
    ]);

    const walletPubkey = new SolanaPublicKey(walletAddress) as unknown as UmiPublicKey;
    const nftMint = generateSigner(umi);

    // Set up transaction builder with necessary compute unit limits
    const txBuilder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV2(umi, {
          candyMachine: candyMachinePda,
          nftMint,
          collectionMint,
          collectionUpdateAuthority: walletPubkey,
        })
      );

    // Send and confirm the transaction
    const signature = await txBuilder.sendAndConfirm(umi);
    console.log('Mint transaction confirmed with signature:', signature);

    return NextResponse.json({ success: true, signature });
  } catch (error) {
    console.error('Minting failed:', error);
    return NextResponse.json({ success: false, message: 'Minting failed', error: error.toString() }, { status: 500 });
  }
}
