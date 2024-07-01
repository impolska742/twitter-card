import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import useAuthStore from "../store/auth";
import { BASE_MAINNET_CHAIN_ID } from "../utils";
import Image from "next/image";
import Link from "next/link";
import localStorageService from "../utils/localStorage";

const OG_TITLE = "Brahma Console - Your primary on-chain interface";
const OG_DESCRIPTION =
  "Discover Brahma, the unified interface for multi-chain operations. Experience efficient execution and secure management of your crypto assets.";
const OG_URL =
  "https://brahma-static.s3.us-east-2.amazonaws.com/Home-Preview-OG2x.png";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { openConnectModal } = useConnectModal();
  const [
    consoles,
    auth,
    loading,
    deployedConsoleAddress,
    success,
    error,
    waitingSignature,
    checkAuthToken,
    fetchAuthSignature,
    fetchEOAConsoles,
    handleDeployNewConsoleOnBase,
  ] = useAuthStore((store) => [
    store.consoles,
    store.auth,
    store.loading,
    store.deployedConsoleAddress,
    store.success,
    store.error,
    store.waitingSignature,
    store.checkAuthToken,
    store.fetchAuthSignature,
    store.fetchEOAConsoles,
    store.handleDeployNewConsoleOnBase,
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!signer) return;
    checkAuthToken(signer);
  }, [checkAuthToken, auth, signer]);

  useEffect(() => {
    if (!address || !auth) return;
    fetchEOAConsoles(address);
  }, [address, auth, fetchEOAConsoles]);

  const deployedConsoleAddressFromLocalStorage = address
    ? localStorageService.getDeployedConsoleAddress(address)
    : undefined;

  const doesConsoleExistOnBase =
    (consoles.organizations.length > 0
      ? consoles.organizations.some((console) =>
          console.chainsOrgHasConsoles.some(
            (chain) => chain === BASE_MAINNET_CHAIN_ID
          )
        )
      : false) || !!deployedConsoleAddressFromLocalStorage;

  const firstConsoleAddressOnBase =
    (consoles.organizations.length > 0
      ? consoles.organizations.find((console) =>
          console.chainsOrgHasConsoles.includes(BASE_MAINNET_CHAIN_ID)
        )?.consoleAddress || null
      : null) || deployedConsoleAddressFromLocalStorage;

  const isAuthenticated = !!auth;

  const isSignerNeeded =
    (loading || waitingSignature || !auth) && isConnected && !signer;

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Brahma</title>

        <meta name="description" content={OG_DESCRIPTION} />

        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:site_name" content="Brahma Console" />
        <meta property="og:url" content={"https://console.brahma.fi/"} />
        <meta property="og:image:secure_url" content={OG_URL} />
        <meta property="og:description" content={OG_DESCRIPTION} />
        <meta property="og:title" content={OG_TITLE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@brahmafi" />
        <meta name="twitter:site" content="@brahmafi" />
        <meta name="twitter:domain" content="brahma.fi" />
      </Head>

      <div
        style={{
          position: "relative",
          display: "flex",
          top: 0,
          left: 0,
        }}
      >
        <Image
          src={success ? "/success.png" : error ? "/failed.png" : "/home.png"}
          width={600}
          height={600}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "600px",
          }}
          alt="img"
        />

        <div
          style={{
            position: "absolute",
            bottom: "250px",
            right: "50%",
            transform: "translateX(50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!address || !isConnected ? (
            <button className="button" onClick={() => openConnectModal?.()}>
              Connect Wallet
            </button>
          ) : isSignerNeeded ? (
            <button
              className="button"
              onClick={async () => {
                if (typeof window !== undefined) {
                  window.location.reload();
                }
              }}
            >
              Refresh
            </button>
          ) : !isAuthenticated && signer ? (
            <button
              className="button"
              onClick={() => fetchAuthSignature(signer)}
            >
              Sign a message
            </button>
          ) : loading || consoles.loading ? (
            <div className="loader"></div>
          ) : !doesConsoleExistOnBase && !success && !error ? (
            <button
              className="button"
              onClick={() => handleDeployNewConsoleOnBase(address)}
            >
              Deploy Console on Base
            </button>
          ) : firstConsoleAddressOnBase ? (
            <Link
              className="button"
              target="_blank"
              href={`https://console.brahma.fi/account/${firstConsoleAddressOnBase}?chainId=${BASE_MAINNET_CHAIN_ID}`}
            >
              Redirect to Console
            </Link>
          ) : success && deployedConsoleAddress ? (
            <Link
              className="button"
              target="_blank"
              href={`https://console.brahma.fi/account/${deployedConsoleAddress}?chainId=${BASE_MAINNET_CHAIN_ID}`}
            >
              Redirect to Console
            </Link>
          ) : (
            error && (
              <button
                className="button"
                onClick={async () => {
                  if (typeof window !== undefined) {
                    window.location.reload();
                  }
                }}
              >
                Refresh
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
