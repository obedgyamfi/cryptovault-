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