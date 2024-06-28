import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import ConsoleApi from "../utils/api";
import { baseMainnet } from "../wagmiChains";

import "../styles/globals.css";
import { SUPPORTED_CHAINS } from "../utils";

const PROJECT_ID = "ae835863ee28f9060bd789bb1f68f711";
const APP_NAME = "Console";

const { chains, provider } = configureChains(SUPPORTED_CHAINS, [
  alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || "",
  }),
  jsonRpcProvider({
    rpc: (chain: Chain) => ({
      http: baseMainnet.rpcUrls.default.http[0],
    }),
  }),
]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      rabbyWallet({ name: APP_NAME, chains }),
      metaMaskWallet({ projectId: PROJECT_ID, chains }),
      walletConnectWallet({ projectId: PROJECT_ID, chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export const consoleApi = new ConsoleApi();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "100px",
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme()}
          appInfo={{
            appName: "Brahma Console",
          }}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}

export default MyApp;
