"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { vaultAbi, vaultAddress } from "@/config/contracts";

const resolvedVaultAddress = vaultAddress as `0x${string}` | undefined;

function formatBalance(value?: bigint) {
  if (value === undefined) {
    return "-";
  }
  return Number.parseFloat(formatEther(value)).toFixed(4);
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const isVaultConfigured = Boolean(resolvedVaultAddress);

  const {
    data: userBalance,
    refetch: refetchUserBalance,
    isFetching: isFetchingUserBalance,
  } = useReadContract({
    address: resolvedVaultAddress,
    abi: vaultAbi,
    functionName: "getBalance",
    args: address ? [address] : undefined,
    query: {
      enabled: isVaultConfigured && Boolean(address),
    },
  });

  const {
    data: vaultBalance,
    refetch: refetchVaultBalance,
    isFetching: isFetchingVaultBalance,
  } = useReadContract({
    address: resolvedVaultAddress,
    abi: vaultAbi,
    functionName: "getVaultBalance",
    query: {
      enabled: isVaultConfigured,
    },
  });

  const {
    writeContractAsync,
    data: transactionHash,
    isPending: isWriting,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: transactionHash,
    });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = isWriting || isConfirming;

  useEffect(() => {
    if (isConfirmed) {
      refetchUserBalance();
      refetchVaultBalance();
      setDepositAmount("");
      setWithdrawAmount("");
      reset();
    }
  }, [isConfirmed, refetchUserBalance, refetchVaultBalance, reset]);

  const statusMessage = useMemo(() => {
    if (!isVaultConfigured) {
      return "Set NEXT_PUBLIC_VAULT_ADDRESS to interact with the contract.";
    }

    if (!isConnected) {
      return "Connect your wallet to continue.";
    }

    if (isConfirming) {
      return "Waiting for transaction confirmation...";
    }

    if (transactionHash) {
      return `Last transaction hash: ${transactionHash}`;
    }

    return null;
  }, [
    isVaultConfigured,
    isConnected,
    isConfirming,
    transactionHash,
  ]);

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    reset();

    if (!resolvedVaultAddress) {
      setFormError("Vault address is not configured.");
      return;
    }

    if (!depositAmount) {
      setFormError("Enter an amount to deposit.");
      return;
    }

    try {
      const value = parseEther(depositAmount);
      if (value <= 0n) {
        throw new Error("Amount must be greater than zero.");
      }

      await writeContractAsync({
        address: resolvedVaultAddress,
        abi: vaultAbi,
        functionName: "deposit",
        value,
      });
    } catch (error: any) {
      setFormError(error.message ?? "Failed to send deposit transaction.");
    }
  };

  const handleWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    reset();

    if (!resolvedVaultAddress) {
      setFormError("Vault address is not configured.");
      return;
    }

    if (!withdrawAmount) {
      setFormError("Enter an amount to withdraw.");
      return;
    }

    try {
      const value = parseEther(withdrawAmount);
      if (value <= 0n) {
        throw new Error("Amount must be greater than zero.");
      }

      await writeContractAsync({
        address: resolvedVaultAddress,
        abi: vaultAbi,
        functionName: "withdraw",
        args: [value],
      });
    } catch (error: any) {
      setFormError(error.message ?? "Failed to send withdraw transaction.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">CryptoVault</h1>
            <p className="text-sm text-slate-400">
              Securely deposit and withdraw ETH from the on-chain vault.
            </p>
          </div>
          <ConnectButton />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Your balance</p>
            <p className="text-xl font-medium text-slate-50">
              {isFetchingUserBalance
                ? "Loading..."
                : `${formatBalance(userBalance)} ETH`}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Vault balance</p>
            <p className="text-xl font-medium text-slate-50">
              {isFetchingVaultBalance
                ? "Loading..."
                : `${formatBalance(vaultBalance)} ETH`}
            </p>
          </div>
        </div>
        {statusMessage && (
          <p className="text-sm text-amber-300/90">{statusMessage}</p>
        )}
        {(formError || writeError) && (
          <p className="text-sm text-rose-300/90">
            {formError ?? writeError?.message}
          </p>
        )}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleDeposit}
          className="flex flex-col gap-4 rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-6"
        >
          <h2 className="text-xl font-semibold text-emerald-100">
            Deposit ETH
          </h2>
          <label className="text-sm text-emerald-200/80" htmlFor="depositAmount">
            Amount
          </label>
          <input
            id="depositAmount"
            name="depositAmount"
            type="number"
            step="any"
            min="0"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            className="rounded-md border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-emerald-100 placeholder:text-emerald-300/40 focus:border-emerald-400 focus:outline-none"
            placeholder="0.0"
            disabled={isBusy}
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800/50 disabled:text-emerald-200/50"
            disabled={!isConnected || !isVaultConfigured || isBusy}
          >
            {isWriting ? "Submitting..." : "Deposit"}
          </button>
        </form>

        <form
          onSubmit={handleWithdraw}
          className="flex flex-col gap-4 rounded-xl border border-indigo-900/60 bg-indigo-950/40 p-6"
        >
          <h2 className="text-xl font-semibold text-indigo-100">
            Withdraw ETH
          </h2>
          <label className="text-sm text-indigo-200/80" htmlFor="withdrawAmount">
            Amount
          </label>
          <input
            id="withdrawAmount"
            name="withdrawAmount"
            type="number"
            step="any"
            min="0"
            value={withdrawAmount}
            onChange={(event) => setWithdrawAmount(event.target.value)}
            className="rounded-md border border-indigo-800/60 bg-indigo-950/40 px-3 py-2 text-indigo-100 placeholder:text-indigo-300/40 focus:border-indigo-400 focus:outline-none"
            placeholder="0.0"
            disabled={isBusy}
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-500 px-4 py-2 font-semibold text-indigo-950 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-800/50 disabled:text-indigo-200/50"
            disabled={!isConnected || !isVaultConfigured || isBusy}
          >
            {isWriting ? "Submitting..." : "Withdraw"}
          </button>
        </form>
      </section>
    </main>
  );
}
