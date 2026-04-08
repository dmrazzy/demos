"use client";

import React, { useState } from "react";
import { stringToHex } from "viem";
import { ensureBaseAccountConnected } from "@/lib/base-account";

interface SignInWithBaseProps {
  onSignIn: (address: string) => void;
  colorScheme?: "light" | "dark";
}

interface WalletConnectResponse {
  accounts?: { address: string }[];
  signInWithEthereum?: {
    message: string;
    signature: string;
  };
}

const MOBILE_USER_AGENT_REGEX = /Android|iPhone|iPad|iPod|Mobile/i;

export const SignInWithBaseButton = ({
  onSignIn,
  colorScheme = "light",
}: SignInWithBaseProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isLight = colorScheme === "light";

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { provider, accounts } = await ensureBaseAccountConnected();

      const nonceResponse = await fetch('/api/auth/verify', { method: 'GET' });
      const { nonce } = await nonceResponse.json();

      const requestedAddress = accounts[0];
      if (!requestedAddress) {
        throw new Error("No account returned from Base Account");
      }

      const isMobileClient = MOBILE_USER_AGENT_REGEX.test(navigator.userAgent);
      let address = requestedAddress;
      let siweResponse: WalletConnectResponse["signInWithEthereum"];

      if (!isMobileClient) {
        try {
          const connectResponse = await provider.request({
            method: "wallet_connect",
            params: [
              {
                version: "1",
                capabilities: {
                  signInWithEthereum: {
                    chainId: '0x2105',
                    nonce,
                  },
                },
              },
            ],
          }) as WalletConnectResponse;

          address = connectResponse.accounts?.[0]?.address ?? requestedAddress;
          siweResponse = connectResponse.signInWithEthereum;
        } catch (error) {
          console.warn("wallet_connect unavailable, falling back to manual sign-in", error);
        }
      }

      if (siweResponse) {
        const { message, signature } = siweResponse;
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, message, signature })
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyData.ok) {
          throw new Error(verifyData.error || 'Signature verification failed');
        }
      } else {
        const domain = window.location.host;
        const uri = window.location.origin;
        const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nAgent Spend Permissions Authentication\n\nURI: ${uri}\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

        const signature = await provider.request({
          method: 'personal_sign',
          params: [stringToHex(message), address]
        }) as string;

        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, message, signature })
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyData.ok) {
          throw new Error(verifyData.error || 'Signature verification failed');
        }
      }

      onSignIn(address);
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`
        flex h-14 w-full items-center justify-center gap-2 rounded-lg px-6 py-4
        text-base font-medium transition-all duration-200 sm:min-w-64 sm:px-8 sm:py-5 sm:text-lg
        ${
          isLight
            ? "bg-white text-black border-2 border-gray-200 hover:bg-gray-50"
            : "bg-black text-white border-2 border-gray-700 hover:bg-gray-900"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div
        className={`
        w-4 h-4 rounded-sm flex-shrink-0
        ${isLight ? "bg-base-blue" : "bg-white"}
      `}
      />
      <span>{isLoading ? "Signing in..." : "Sign in with Base"}</span>
    </button>
  );
};
