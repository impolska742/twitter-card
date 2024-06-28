import { Chain } from "@rainbow-me/rainbowkit";

export const BASE_RPC =
  process.env.NODE_ENV === "production"
    ? "https://base-mainnet.blastapi.io/a576df6e-da85-4074-9a31-e3d8ea4f761d"
    : "https://base.llamarpc.com";

const baseMainnet = {
  id: 8453,
  name: "Base Mainnet",
  iconUrl:
    "https://raw.githubusercontent.com/base-org/brand-kit/8984fe6e08be3058fd7cf5cd0b201f8b92b5a70e/logo/in-product/Base_Network_Logo.svg",
  testnet: false,
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: {
      http: [BASE_RPC],
    },
    default: {
      http: [BASE_RPC],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Basescan",
      url: "https://basescan.org",
    },
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022,
    },
  },
} as const satisfies Chain;

export { baseMainnet };
