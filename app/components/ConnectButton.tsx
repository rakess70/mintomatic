// components/ConnectButton.tsx

import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";

export default function ConnectButton() {
  const { open } = useAppKit(); // Opens the wallet connect modal
  const { isConnected } = useAppKitAccount(); // Checks if wallet is connected
  const { disconnect } = useDisconnect(); // Handles wallet disconnection

  return (
    <div>
      {isConnected ? (
        <>
          <button onClick={disconnect} className="px-4 py-2 bg-red-500 text-white rounded">
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button onClick={() => open({ view: "Connect" })} className="px-4 py-2 bg-blue-500 text-white rounded">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
