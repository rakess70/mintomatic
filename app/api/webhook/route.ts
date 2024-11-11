import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Parse the request body
        const body = await req.json();

        console.log("[Webhook] Received:", body);

        const { mintAddress, passThroughArgs, txId, walletAddress } = body;
        const referrer = passThroughArgs?.referer;

        const amount = parseFloat(process.env.REFERRAL_AMOUNT || '1');
        const referralRadiusApiKey = process.env.REFERRAL_RADIUS_API_KEY; // New environment variable
        const productId = process.env.REFERRAL_RADIUS_PRODUCT_ID; // New environment variable

        if (!referralRadiusApiKey || !productId) {
            throw new Error("Missing necessary environment variables.");
        }

        if (referrer && mintAddress) {
            await logReferralTransactionToReferralRadius({
                referrerId: referrer,
                nftId: mintAddress,
                transactionId: txId,
                walletAddress: walletAddress || '',
                amount,
                productId,
                apiKey: referralRadiusApiKey,
            });
        }

        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        console.error("Error handling webhook:", error);
        return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
    }
}

// Function to log the transaction to ReferralRadius
interface ReferralPayload {
    referrerId: string;
    nftId: string;
    transactionId?: string;
    walletAddress?: string;
    amount: number;
    productId: string;
    apiKey: string;
}

async function logReferralTransactionToReferralRadius(payload: ReferralPayload) {
    try {
        const apiUrl = `https://www.referralradius.com/api/referrals`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.json();
        console.log("Payload:", payload);
        console.log("ReferralRadius API response:", responseText);

        if (!response.ok) {
            throw new Error(`Failed to log referral transaction: ${response.statusText} - ${JSON.stringify(responseText)}`);
        }

        console.log("Referral transaction logged successfully to ReferralRadius.");
    } catch (error) {
        console.error("Error logging referral transaction to ReferralRadius:", error);
    }
}
