import {
  Address,
  ConsoleAccount,
  EOAConsolesResume,
  EOAOrganization,
  GetEOAOrganizations,
  SupportedChainIds,
} from "./types";
import { getAccount } from "@wagmi/core";

export default function mapOrganizations(
  eoaOrganizations: GetEOAOrganizations
): EOAOrganization[] {
  try {
    const organizations: EOAOrganization[] = Object.keys(eoaOrganizations).map(
      (orgName) => {
        const consolesResume: EOAConsolesResume[] = eoaOrganizations[orgName];

        const chainsOrgHasConsoles = consolesResume.map(
          (console) => console.chainId
        );

        const orgConsoleAccount = mapConsoleResumeToAccount(consolesResume[0], {
          orgName: orgName,
        });

        return {
          ...orgConsoleAccount,
          chainsOrgHasConsoles,
        };
      }
    );
    return organizations;
  } catch (err) {
    console.error("Error mapping organizations", err);
    return [];
  }
}

type OrgDetails = {
  orgName: string;
};

const mapConsoleResumeToAccount = (
  consoleResume: EOAConsolesResume,
  orgDetails: OrgDetails
): ConsoleAccount => {
  const account = getAccount();
  const eoa = account?.address as Address;

  const { orgName } = orgDetails;

  const consoleAccount: ConsoleAccount = {
    eoa: eoa,
    consoleAddress: consoleResume.address,
    accountName: consoleResume.consoleName,
    profileName: orgName,
    chainId: consoleResume.chainId,
    isOwner: consoleResume.isOwner,
    isEoaPartOfOwners: consoleResume.owners
      .map((owner) => owner.toLowerCase())
      .includes(eoa.toLowerCase()),
    mainConsoleAddress: null,
    isSubAccount: false,
  };
  return consoleAccount;
};
