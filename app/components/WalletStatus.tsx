// components/WalletStatus.tsx

import { useEffect } from "react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";

interface WalletStatusProps {
  onConnectionChange?: (isConnected: boolean, walletAddress: string | null) => void;
  label?: string;
}

// Hook for wallet connection status
export function useWalletStatus() {
  const { isConnected, address } = useAppKitAccount();
  return {
    isWalletConnected: isConnected,
    walletAddress: address ? `${address.slice(0, 6)}...${address.slice(-6)}` : null,
  };
}

// Main WalletStatus component
export default function WalletStatus({ onConnectionChange, label = "Connect Wallet" }: WalletStatusProps) {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  // Notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected, address || null); // Pass both connection status and address
    }
  }, [isConnected, address, onConnectionChange]);

  return (
    <div className="flex flex-col items-center">
      {isConnected ? (
        <>
          <p className="text-gray-300">Connected: {address.slice(0, 6)}...{address.slice(-6)}</p>
          <button onClick={disconnect} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
            Disconnect
          </button>
        </>
      ) : (
        // Adjusting <appkit-button /> to use the `label` and `size` properties
        <appkit-button label={label}></appkit-button>
      )}
    </div>
  );
}
