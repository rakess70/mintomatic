// components/WalletStatus.tsx

import { useEffect, useState } from "react";
import { useAppKitAccount, useDisconnect, useAppKit } from "@reown/appkit/react";

interface WalletStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
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
  const { open } = useAppKit(); // Open the wallet connect modal
  const { isConnected, address } = useAppKitAccount(); // Wallet connection status and address
  const { disconnect } = useDisconnect(); // Disconnect handler

  // Notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

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
        <button
          onClick={() => open({ view: "Connect" })}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {label}
        </button>
      )}
    </div>
  );
}
