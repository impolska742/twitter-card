import { AxiosInstance } from "axios";

import { apiInstance } from "./axios";
import {
  Address,
  AuthData,
  AuthLoginRequest,
  GetEOAOrganizations,
} from "./types";

const ConsoleApiRoutes = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    modes: "/auth/modes",
    access_key: "/auth/access_key",
  },
  consoleExistsOnBase: "/v1/accounts/auth/eoaAddress",
  eoaConsoles: "/accounts/auth",
  baseCampaign: "/campaign/create-console",
} as const;

export default class ConsoleApi {
  api: AxiosInstance;
  routes = ConsoleApiRoutes;

  constructor() {
    this.api = apiInstance;
  }

  setAuthToken(accessToken: string) {
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  async fetchAuthToken(payload: AuthLoginRequest): Promise<AuthData | null> {
    try {
      const response = await this.api.post<AuthData>(
        this.routes.auth.login,
        payload
      );
      return response as unknown as AuthData;
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  async refreshAuthToken(refreshToken: string): Promise<AuthData | null> {
    try {
      const headers = {
        Authorization: `Bearer ${refreshToken}`,
      };
      const response = await this.api.post(
        this.routes.auth.refresh,
        {},
        {
          headers,
        }
      );
      return response as unknown as AuthData;
    } catch (err: any) {
      console.error("error on refreshAuthToken");
      return null;
    }
  }

  async fetchEOAConsoles(userAddress: Address): Promise<GetEOAOrganizations> {
    try {
      const response = await this.api.get<{
        organizations: GetEOAOrganizations;
      }>(`${this.routes.eoaConsoles}/${userAddress}`);

      return response.data.organizations;
    } catch (err: any) {
      console.error(err?.message);
      return {};
    }
  }

  async fetchDoesConsoleExists(userAddress: Address): Promise<boolean> {
    try {
      await this.api.get(`${this.routes.eoaConsoles}/${userAddress}`);

      return true;
    } catch (err: any) {
      console.error(err?.message);
      return false;
    }
  }

  async deployBaseConsole(userAddress: Address): Promise<string> {
    try {
      const response = await this.api.post(this.routes.baseCampaign, {
        eoa: userAddress,
      });

      return response.data.txnHash;
    } catch (err: any) {
      console.error(err?.message);
      return "" as Address;
    }
  }
}
