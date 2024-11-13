// components/ConnectButton.tsx

"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function ConnectButton() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  return (
    <button
      onClick={() => open({ view: "Connect" })}
      className="p-2 bg-blue-500 text-white rounded"
    >
      {isConnected ? "Connected" : "Connect Wallet"}
    </button>
  );
}
