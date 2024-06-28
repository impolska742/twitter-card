import { v4, V4Options } from "uuid";
import { baseMainnet } from "../wagmiChains";

export const generateUUID = (options?: V4Options) => {
  return v4(options);
};

export const SUPPORTED_CHAINS = [baseMainnet];

export const BASE_MAINNET_CHAIN_ID = baseMainnet.id;
