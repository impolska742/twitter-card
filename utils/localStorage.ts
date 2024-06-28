import { Address, AuthData } from "./types";

const storagePrefix = "brahma_twitter";

const storageKeys = {
  auth: "auth",
};

export type ConnectDappsCacheData = {
  timestamp: number;
  connectDapps: string;
};

const localStorageService = {
  checkAuthToken: (address: Address): AuthData | null => {
    const authTokenKey = `${storagePrefix}_${storageKeys.auth}-${address}`;
    const authToken = localStorage.getItem(authTokenKey);
    const parsedAuthToken = authToken ? JSON.parse(authToken) : null;

    return parsedAuthToken;
  },

  saveAuthToken: (address: Address, authToken: AuthData): void => {
    if (!address || address === "0x") return;
    const authTokenKey = `${storagePrefix}_${storageKeys.auth}-${address}`;
    const stringfiedAuthToken = JSON.stringify(authToken);
    localStorageService.resetOtherAuthTokens(address);
    localStorage.setItem(authTokenKey, stringfiedAuthToken);
  },

  clearAuthToken: (address: Address): void => {
    const authTokenKey = `${storagePrefix}_${storageKeys.auth}-${address}`;
    localStorage.removeItem(authTokenKey);
  },

  resetOtherAuthTokens: (address: Address): void => {
    if (typeof window !== "undefined") {
      Object.keys(localStorage || {}).forEach((key) => {
        if (
          key.includes(`${storagePrefix}_${storageKeys.auth}`) &&
          !key.includes(address)
        ) {
          localStorage.removeItem(key);
        }
      });
    }
  },
};

export default localStorageService;
