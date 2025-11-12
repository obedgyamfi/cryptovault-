import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem';
// import { sepolia } from 'wagmi/chains'

// export const config = createConfig({
//   chains: [sepolia],
//   transports: {
//     [sepolia.id]: http(),
//   },
// })


export const localhostChain = defineChain({
  id: 31337,
  name: 'localhost',
  network: 'localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] }, // ✅ must be { http: string[] }
  },
  blockExplorers: { default: { name: 'none', url: '' } },
});

// 2️⃣ Create the Wagmi config using the local chain
export const config = createConfig({
  chains: [localhostChain],
  transports: {
    [localhostChain.id]: http(localhostChain.rpcUrls.default.http[0]),
  },
});
