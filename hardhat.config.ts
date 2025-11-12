import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import type { NetworksUserConfig } from "hardhat/types";

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY;

const networks: NetworksUserConfig = {
  hardhatMainnet: {
    type: "edr-simulated",
    chainType: "l1",
  },
  hardhatOp: {
    type: "edr-simulated",
    chainType: "op",
  },
};

if (sepoliaRpcUrl && sepoliaPrivateKey) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    url: sepoliaRpcUrl,
    accounts: [sepoliaPrivateKey],
  };
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks,
});
