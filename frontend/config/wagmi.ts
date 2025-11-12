import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: "CryptoVault" }),
  ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
];

export const config = createConfig({
  chains: [sepolia],
  connectors,
  ssr: true,
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});