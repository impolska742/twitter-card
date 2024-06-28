import { AxiosInstance } from "axios";
import { SUPPORTED_CHAINS } from ".";

export const SUPPORTED_CHAINS_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export type SupportedChainIds = (typeof SUPPORTED_CHAINS_IDS)[number];

export type ChainConfig<T> = {
  [K in SupportedChainIds]: T;
};

export type Address = `0x${string}`;

export type AuthData = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
  redirect: boolean;
  eoa: Address;
};

export enum AuthModes {
  SIGNATURE = "signature",
  ACCESS_KEY = "access_key",
}

export type AuthActions =
  | "login"
  | "snap-login"
  | "create-access-key"
  | "delete-access-key";

export type SignAuthMessage = {
  eoa: Address;
  message: string;
  timestamp: number;
  action: AuthActions;
};

export type AuthLoginRequest = {
  signature: string;
  mode?: AuthModes;
  data: {
    types: typeof SIGN_AUTH_TYPES;
    primaryType: typeof SIGN_AUTH_PRIMARY_TYPE;
    domain: typeof SIGN_AUTH_DOMAIN;
    message: SignAuthMessage;
  };
};

export const AUTH_SIGNATURE_MESSAGE = "I'm a console user";

export const SIGN_AUTH_TYPES = {
  LoginRequest: [
    {
      name: "eoa",
      type: "address",
    },
    {
      name: "message",
      type: "string",
    },
    {
      name: "timestamp",
      type: "uint256",
    },
    {
      name: "action",
      type: "string",
    },
  ],
  EIP712Domain: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
  ],
};

export const SIGN_AUTH_PRIMARY_TYPE = "LoginRequest";

export const SIGN_AUTH_DOMAIN = {
  name: "BrahmaConsole",
  version: "1",
};

export type { AxiosInstance };

export type GetEOAOrganizations = Record<string | Address, EOAConsolesResume[]>;

export type PreferenceMode = "NORMAL" | "FAST";

export type PaymentToken = "ETH" | "USDC" | "SEI";

export type ExecutionModeObject = {
  id: string;
  modeTitle: PreferenceMode;
  gasPriority: string;
  value: string;
  priority: string;
  amount: string;
  duration: string;
};

export type PaymentTokenObject = {
  id: string;
  name: string;
  icon: React.ReactNode;
  symbol: PaymentToken;
  address: Address;
  decimal: number;
};

export type AssetSettingData = {
  showDustBalance: boolean;
  showUnverifiedTokens: boolean;
};

export type ProtocolItem = {
  id: string;
  name: string;
  logo: string;
  isSelected?: boolean;
};

export type SettingFields = {
  gasPreference: PreferenceMode;
  feeToken: PaymentToken;
  whitelistedProtocols: ProtocolItem[];
  assetSetting?: AssetSettingData;
};

export type ContactAddressType =
  | "Owner"
  | "EOA"
  | "Main Account"
  | "Operator"
  | "Sub Account"
  | "Protocol"
  | "Contract"
  | "Main Console"
  | "Console Sub-Account";

export type ContactApiError = {
  title: string;
  message: string;
};

export type SharedWithContactAddress = {
  name: string;
  sub_account_address: Address;
};

export type ContactAddress = {
  address: Address;
  createdBy: string;
  name: string;
  type: ContactAddressType;
  isMultiChain: boolean;
  sharedWith: SharedWithContactAddress[] | null;
};

export type PatchBodyPayload = {
  signer: Address;
  signature: string;
  request: {
    domain: {
      name: string;
      chainId: number;
    };
    message: {
      consoleAddress: Address;
      userName: string;
    };
  };
};

export type PatchSubAccountPayload = {
  signer: Address;
  signature: string;
  request: {
    domain: {
      verifyingContract: string;
      chainId: number;
    };
    primaryType: "ModifyModeratedAccount";
    message: {
      moderatedAddress: Address;
      name: string;
    };
  };
};

export type ContactActionConfig = {
  isActionModalOpen: boolean;
  actions: ContactActions[];
  selectedContact: ContactAddress | null;
};

export type ContactActions = {
  title: string;
  logo: React.ReactNode;
  actionCallback: (contact: ContactAddress) => void;
  notAvailableFor: ContactAddress["type"][];
};

export type AddressConfig = {
  id: string;
  address: Address;
  name: string;
  isLoading: boolean;
  isValidAddress: boolean;
  isMultiChain: boolean;
  isModalOpen: boolean;
  isAddressEditable: boolean;
  isExpanded: boolean;
  sharedWith: Address[];
};

export type AddAddressbookPayload = {
  addressBooks: AddAddressbookContact[];
};

export type AddAddressbookContact = {
  address: AddressConfig["address"];
  name: AddressConfig["name"];
  sharedWith: AddressConfig["sharedWith"];
  isMultiChain: AddressConfig["isMultiChain"];
};

export type EditAddressbookContactPayload = {
  name: AddressConfig["name"];
  address: AddressConfig["name"];
  isMultiChain: AddressConfig["isMultiChain"];
  shareWith: AddressConfig["sharedWith"];
  unShareWith: AddressConfig["sharedWith"];
};

export type DeleteAddressbookContactPayload = {
  isMultiChain: AddressConfig["isMultiChain"];
  address: AddressConfig["address"];
};

export type AddAddressData = {
  isLoading: boolean;
  data: AddressConfig[];
};

export enum TypeOfAddressData {
  ADD_ADDRESS = "ADD_ADDRESS",
  UPDATE_ADDRESS = "UPDATE_ADDRESS",
}

export enum ActionType {
  ADD = "ADD",
  EDIT = "EDIT",
  DELETE = "DELETE",
}

export type AddressConfigUpdateFields =
  | "address"
  | "name"
  | "isMultiChain"
  | "sharedWith"
  | "isExpanded";

export type AddressConfigFieldTypes = {
  address: string;
  name: string;
  isMultiChain: boolean;
  sharedWith: Address[];
  isExpanded: boolean;
};

export type AddressConfigUpdateFieldType<T extends AddressConfigUpdateFields> =
  AddressConfigFieldTypes[T];

export type FeeTokenAddressMap = ChainConfig<{
  [key in PaymentToken]: Address;
}>;

export type SettingProps = Record<number, SettingFields>;

export type EOAConsolesResume = {
  address: Address;
  chainId: SupportedChainIds;
  consoleName: Address; //string
  isOwner: boolean;
  owners: Address[];
  threshold: number;
  totalAccessibleAccounts: number;
};

export type ConsoleAccount = {
  eoa: Address;
  consoleAddress: Address;
  mainConsoleAddress: Address | null;
  accountName: string;
  profileName: string;
  isSubAccount: boolean;
  isOwner: boolean;
  isEoaPartOfOwners: boolean;
  chainId: SupportedChainIds;
};

export type EOAOrganization = ConsoleAccount & {
  chainsOrgHasConsoles: SupportedChainIds[];
};
