"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import VaultABI from "@/artifacts/Vault.json";

export function VaultBalance() {
  const { address } = useAccount();
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

  const { data: balance, isLoading } = useReadContract({
    address: vaultAddress,
    abi: VaultABI.abi,
    functionName: "balances",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  if (!address) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400">
        Connect wallet to view balance
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-zinc-500">Loading balance...</div>;
  }

  return (
    <div className="text-2xl font-bold">
      {balance ? formatEther(balance as bigint) : "0"} ETH
    </div>
  );
}