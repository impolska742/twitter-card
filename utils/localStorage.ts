import { Address, AuthData } from "./types";

const storagePrefix = "brahma_twitter";

const storageKeys = {
  auth: "auth",
  deployedConsoleAddresses: "deployedConsoleAddresses",
};

const localStorageService = {
  checkAuthToken: (address: Address): AuthData | null => {
    const authTokenKey = `${storagePrefix}_${storageKeys.auth}-${address}`;
    const authToken = localStorage.getItem(authTokenKey);
    console.log({ authToken });
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

  saveDeployedConsoleAddress: (
    address: Address,
    consoleAddress: Address
  ): void => {
    if (typeof window !== "undefined") {
      const deployedConsoleAddressesKey = `${storagePrefix}_${storageKeys.deployedConsoleAddresses}`;
      const deployedConsoleAddresses = localStorage.getItem(
        deployedConsoleAddressesKey
      );
      const parsedDeployedConsoleAddresses = deployedConsoleAddresses
        ? JSON.parse(deployedConsoleAddresses)
        : {};
      parsedDeployedConsoleAddresses[address.toLowerCase()] = consoleAddress;
      localStorage.setItem(
        deployedConsoleAddressesKey,
        JSON.stringify(parsedDeployedConsoleAddresses)
      );
    }
  },

  getDeployedConsoleAddress: (address: Address): Address | undefined => {
    if (typeof window !== "undefined") {
      const deployedConsoleAddressesKey = `${storagePrefix}_${storageKeys.deployedConsoleAddresses}`;
      const deployedConsoleAddresses = localStorage.getItem(
        deployedConsoleAddressesKey
      );
      const parsedDeployedConsoleAddresses = deployedConsoleAddresses
        ? JSON.parse(deployedConsoleAddresses)
        : {};
      console.log({ parsedDeployedConsoleAddresses });
      return parsedDeployedConsoleAddresses[address.toLowerCase()];
    }
  },
};

export default localStorageService;
