"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import VaultArtifact from "@/artifacts/Vault.json";

export function DepositForm() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !address) return;

    writeContract({
      address: vaultAddress,
      abi: VaultArtifact.abi,
      functionName: "deposit",
      value: parseEther(amount),
    });
  }

  if (isSuccess) {
    setTimeout(() => {
      setAmount("");
    }, 2000);
  }

  return (
    <form onSubmit={handleDeposit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Amount (ETH)
        </label>
        <input
          type="text"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
          disabled={!address || isPending || isConfirming}
        />
      </div>
      <button
        type="submit"
        disabled={!address || !amount || isPending || isConfirming}
        className="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 disabled:bg-zinc-300 disabled:cursor-not-allowed"
      >
        {isPending ? "Confirming..." : isConfirming ? "Processing..." : isSuccess ? "Success!" : "Deposit"}
      </button>
    </form>
  );
}