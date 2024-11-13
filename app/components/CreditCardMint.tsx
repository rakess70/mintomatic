// components/CreditCardMint.tsx

import { useState } from "react";
import { useWalletStatus } from "./WalletStatus"; // Use the hook to get wallet status

interface CreditCardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
  email: string;
}

export default function CreditCardMint() {
  const [formData, setFormData] = useState<CreditCardFormData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Use wallet connection status
  const { isWalletConnected, walletAddress } = useWalletStatus();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process the payment using form data
      await processCreditCardPayment();

      // Determine wallet address, either connected wallet or custodial
      const address = isWalletConnected && walletAddress ? walletAddress : await createCustodialWallet();

      // Mint the NFT to the determined wallet address
      await mintNFTToWallet(address);

      setSuccess(true);
      setFormData({ cardNumber: "", expiryDate: "", cvv: "", name: "", email: "" });
    } catch (err) {
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processCreditCardPayment = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const createCustodialWallet = async (): Promise<string> => {
    console.log("Creating custodial wallet...");
    const custodialWalletAddress = "GeneratedCustodialWalletAddress";
    return custodialWalletAddress;
  };

  const mintNFTToWallet = async (walletAddress: string) => {
    console.log(`Minting NFT to wallet address: ${walletAddress}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="credit-card-mint p-4 bg-gray-900 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Mint with Credit Card</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">Mint successful!</p>}

      {/* Wallet Connection Display */}
      <div className="mb-6 text-center">
        {isWalletConnected ? (
          <p className="text-gray-300">NFT will be sent to Wallet: {walletAddress}</p>
        ) : (
          <p className="text-gray-400">No wallet connected. We will create a custodial wallet for you or Connect your wallet (optional).</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Cardholder Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
            placeholder="email@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
            maxLength={16}
            required
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Expiry Date</label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              maxLength={3}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 rounded text-white mt-4"
          disabled={loading}
        >
          {loading ? "Processing..." : "Mint with Credit Card"}
        </button>
      </form>
    </div>
  );
}
