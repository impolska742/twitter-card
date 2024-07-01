import { create } from "zustand";
import { signTypedData, getAccount, fetchSigner } from "@wagmi/core";
import { Signer, providers, Contract } from "ethers";
import safeDeployerAbi from "../abi/safe-deployer.json";

import {
  Address,
  AUTH_SIGNATURE_MESSAGE,
  AuthData,
  AuthLoginRequest,
  EOAOrganization,
  SIGN_AUTH_DOMAIN,
  SIGN_AUTH_PRIMARY_TYPE,
  SIGN_AUTH_TYPES,
} from "../utils/types";
import localStorageService from "../utils/localStorage";
import { consoleApi } from "../pages/_app";
import mapOrganizations from "../utils/mapOrganizations";
import { BASE_RPC } from "../wagmiChains";

type AuthStore = {
  consoles: {
    loading: boolean;
    organizations: EOAOrganization[];
  };
  consoleExistsOnBase: boolean;
  deployedConsoleAddress: Address;
  loading: boolean;
  success: boolean;
  error: boolean;
  waitingSignature: boolean;
  auth: AuthData | null;
  checkAuthToken: (signer: Signer) => Promise<void>;
  fetchAuthSignature: (signer?: Signer) => Promise<void>;
  refreshAuth: (authToken?: AuthData) => Promise<string | null>;
  clearAuthStorage: () => void;
  fetchEOAConsoles: (userAddress: Address) => Promise<void>;
  handleDeployNewConsoleOnBase: (userAddress: Address) => Promise<void>;
  fetchDoesConsoleExists: (userAddress: Address) => Promise<void>;
};

const useAuthStore = create<AuthStore>((set, get) => ({
  loading: true,
  success: false,
  consoleExistsOnBase: false,
  error: false,
  deployedConsoleAddress: "" as Address,
  consoles: {
    loading: false,
    organizations: [],
  },
  waitingSignature: false,
  auth: null,
  checkAuthToken: async (signer) => {
    try {
      const { refreshAuth } = get();
      const eoa = await signer.getAddress();
      const authToken = localStorageService.checkAuthToken(eoa as Address);

      if (!authToken) {
        set({ auth: null });
        // await fetchAuthSignature(signer)
        return;
      }
      const isTokenExpired = getIsTokenExpired(authToken.expiresAt);
      if (isTokenExpired) {
        await refreshAuth(authToken);
        return;
      }
      consoleApi.setAuthToken(authToken.accessToken);
      localStorageService.saveAuthToken(eoa as Address, authToken);
      set({
        auth: { ...authToken, eoa: eoa as Address },
        loading: false,
      });
      return;
    } catch (err) {
      console.log(err);
    }
  },

  fetchAuthSignature: async (signer?: Signer) => {
    try {
      if (get().waitingSignature) return;
      console.log({ waitingSignature: get().waitingSignature });
      set({ waitingSignature: true });
      const selectedSigner = signer || (await fetchSigner());
      if (!selectedSigner) return;
      const eoa = await selectedSigner.getAddress();

      const timestamp = Math.floor(Date.now() / 1000);

      const signature = await signTypedData({
        domain: SIGN_AUTH_DOMAIN,
        types: SIGN_AUTH_TYPES,
        value: {
          eoa: eoa,
          message: AUTH_SIGNATURE_MESSAGE,
          timestamp: timestamp,
          action: "login",
        },
      });

      const authLoginRequest: AuthLoginRequest = {
        signature,
        data: {
          types: SIGN_AUTH_TYPES,
          primaryType: SIGN_AUTH_PRIMARY_TYPE,
          domain: SIGN_AUTH_DOMAIN,
          message: {
            eoa: eoa as Address,
            message: AUTH_SIGNATURE_MESSAGE,
            timestamp: timestamp,
            action: "login",
          },
        },
      };

      set({ waitingSignature: false });

      const authData = await consoleApi.fetchAuthToken(authLoginRequest);

      console.log({ authData });

      if (authData?.redirect) {
        set({
          auth: { ...authData, eoa: eoa as Address },
          loading: false,
        });
        return;
      }

      if (!authData) {
        throw Error("No response from API");
      }
      localStorageService.saveAuthToken(eoa as Address, authData);
      consoleApi.setAuthToken(authData.accessToken);
      set({ auth: { ...authData, eoa: eoa as Address }, loading: false });
    } catch (error) {
      set({ waitingSignature: false, auth: null });
      console.error("error", error);
    }
  },

  refreshAuth: async (authToken?: AuthData) => {
    try {
      const { auth } = get();
      const authToBeUsed = authToken || auth;
      // const authExpiresAt = authToBeUsed?.expiresAt as number

      if (!authToBeUsed || authToBeUsed?.redirect) return null;
      const account = getAccount();
      const address = account?.address as Address;
      const authData = await consoleApi.refreshAuthToken(
        authToBeUsed.refreshToken
      );
      if (!authData) return null;
      localStorageService.saveAuthToken(address as Address, authData);
      consoleApi.setAuthToken(authData.accessToken);
      set({
        auth: { ...authData, eoa: address as Address },
        loading: false,
      });
      return authData.accessToken;
    } catch (err) {
      console.error("error on refreshAuth", err);
      return null;
    }
  },

  clearAuthStorage: () => {
    try {
      const account = getAccount();
      const address = account?.address as Address;
      localStorageService.clearAuthToken(address);
      set({ auth: null });
    } catch (err) {
      console.error("Error cleaning localStorage");
    }
  },

  fetchEOAConsoles: async (userAddress: Address) => {
    try {
      set((state) => ({
        ...state,
        consoles: {
          ...state.consoles,
          loading: true,
        },
      }));

      const eoaOrganizations = await consoleApi.fetchEOAConsoles(userAddress);

      const organizations = mapOrganizations(eoaOrganizations);
      console.log("organizations", organizations);

      set((state) => ({
        ...state,
        consoles: {
          organizations,
          loading: false,
        },
      }));
    } catch (err: any) {
      set((state) => ({
        ...state,
        consoles: {
          ...state.consoles,
          loading: false,
        },
      }));
      console.error("Error fetching user data", err);
    }
  },

  handleDeployNewConsoleOnBase: async (userAddress: Address) => {
    try {
      set({
        loading: true,
      });

      const txnHash = await consoleApi.deployBaseConsole(userAddress);
      const safeDeployer = "0x6d70df6f203204a11b1c8bc67b42b751e7171add";

      const provider = new providers.JsonRpcProvider(BASE_RPC);

      const safeDeployerContract = new Contract(
        safeDeployer,
        safeDeployerAbi,
        provider
      );

      const receipt = await provider.waitForTransaction(txnHash);

      let deployedConsoleAddress;

      for (let log of receipt.logs) {
        try {
          const parsedLog = safeDeployerContract.interface.parseLog(log);

          if (parsedLog.name === "ConsoleAccountDeployed") {
            const consoleAddress = parsedLog.args.consoleAddress;
            console.log("consoleAddress", consoleAddress);
            deployedConsoleAddress = consoleAddress;
            break;
          }
        } catch (e) {
          console.log(e);
        }
      }

      if (!deployedConsoleAddress) {
        throw new Error(
          "An unknown error occurred while deploying the console."
        );
      }

      console.log(
        `Console with address : ${deployedConsoleAddress} is deployed on Base`
      );

      localStorageService.saveDeployedConsoleAddress(
        userAddress,
        deployedConsoleAddress as Address
      );
      await get().fetchEOAConsoles(userAddress);
      set({
        success: true,
        error: false,
        loading: false,
        deployedConsoleAddress,
      });
    } catch (err) {
      set({
        error: true,
        success: false,
        loading: false,
      });
      console.log(err);
    }
  },

  fetchDoesConsoleExists: async (userAddress: Address) => {
    try {
      set({ consoleExistsOnBase: false, loading: true });

      const consoleExistsOnBase = await consoleApi.fetchDoesConsoleExists(
        userAddress
      );

      set({ consoleExistsOnBase, loading: false });
    } catch (err: any) {
      set({ consoleExistsOnBase: false, loading: false });
      console.error("Error fetching user data", err);
    }
  },
}));

export default useAuthStore;

export function getIsTokenExpired(expiresAt: number) {
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
}
