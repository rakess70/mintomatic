// components/WalletStatus.tsx
import React, { useEffect } from "react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";

export default function WalletStatus({ onConnectionChange }: { onConnectionChange?: (connected: boolean) => void }) {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  // Notify parent component of connection status change
  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  return (
    <div className="flex items-center justify-center mb-4">
      {isConnected ? (
        <div className="flex flex-col items-center">
          <span className="text-gray-300">Connected Wallet: {formatAddress(address)}</span>
          <button onClick={disconnect} className="mt-2 px-4 py-1 bg-red-500 text-white rounded">
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <span className="text-gray-400">No Wallet Connected</span>
      )}
    </div>
  );
}
