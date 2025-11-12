"use client"
import { ConnectButton } from "@/components/ConnectButton";
import dynamic from "next/dynamic";
// import { VaultBalance } from "@/components/VaultBalance";
const VaultBalance = dynamic(
  () =>
    import("../components/VaultBalance").then((mod) => mod.VaultBalance),
  {
    ssr: false,
  }
);
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 py-16 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">CryptoVault</h1>
          <ConnectButton />
        </div>

        {/* Balance Card */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Your Vault Balance
          </h2>
          <VaultBalance />
        </div>

        {/* Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Deposit</h2>
            <DepositForm />
          </div>

          {/* Withdraw Card */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Withdraw</h2>
            <WithdrawForm />
          </div>
        </div>
      </main>
    </div>
  );
}