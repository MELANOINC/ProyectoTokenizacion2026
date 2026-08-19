"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { polygon } from "wagmi/chains";
import { chainMeta } from "@/lib/web3/config";
import { formatWalletError, isMetaMaskInstalled } from "@/lib/web3/errors";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function subscribeNoop() {
  return () => {};
}

export function WalletBar() {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const {
    connectAsync,
    connectors,
    isPending,
    error: connectError,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();
  const [localError, setLocalError] = useState<string | null>(null);

  const preferredConnectors = useMemo(() => {
    return [...connectors].sort((a, b) => {
      const score = (id: string, type: string) => {
        if (id === "metaMaskSDK" || id === "metaMask") return 0;
        if (type === "injected") return 1;
        return 2;
      };
      return score(a.id, a.type) - score(b.id, b.type);
    });
  }, [connectors]);

  const supported = chainId === polygon.id;
  const meta = chainMeta[chainId];

  async function onConnect() {
    setLocalError(null);
    if (!isMetaMaskInstalled()) {
      setLocalError(
        "MetaMask no detectado. Instalá la extensión e iniciá sesión en esta cuenta del navegador.",
      );
      window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
      return;
    }
    if (!preferredConnectors.length) {
      setLocalError("No hay conector de wallet disponible.");
      return;
    }

    let lastError: unknown;
    for (const connector of preferredConnectors) {
      try {
        await connectAsync({ connector, chainId: polygon.id });
        return;
      } catch (error) {
        lastError = error;
        const message = formatWalletError(error);
        if (/cancelada|rejected|denied/i.test(message)) {
          setLocalError(message);
          return;
        }
      }
    }
    setLocalError(formatWalletError(lastError));
  }

  if (!mounted) {
    return (
      <div className="panel flex items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--slate)]">
        Preparando conexión MetaMask…
      </div>
    );
  }

  const errorMessage =
    localError ||
    (connectError ? formatWalletError(connectError) : null) ||
    (switchError ? formatWalletError(switchError) : null);

  return (
    <div className="panel space-y-3 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--slate)] uppercase">
            Wallet
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
            {isConnected && address ? shortAddress(address) : "MetaMask desconectada"}
          </p>
          <p className="text-sm text-[var(--ink-soft)]">
            {isConnected
              ? supported
                ? meta?.label
                : `Red no soportada (chainId ${chainId})`
              : "Conectá MetaMask en Polygon Mainnet"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={onConnect}
              disabled={isPending || status === "connecting"}
              className="btn-primary text-sm disabled:opacity-60"
            >
              {isPending || status === "connecting"
                ? "Conectando…"
                : "Conectar MetaMask · Mainnet"}
            </button>
          ) : (
            <>
              {!supported ? (
                <button
                  type="button"
                  disabled={isSwitching}
                  onClick={() => switchChain({ chainId: polygon.id })}
                  className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] hover:border-[var(--ink)]"
                >
                  {isSwitching ? "Cambiando…" : "Usar Polygon Mainnet"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => disconnect()}
                className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink-soft)] hover:border-[var(--ink)]"
              >
                Desconectar
              </button>
            </>
          )}
        </div>
      </div>

      {errorMessage ? (
        <p className="border border-[#8a3b3b] bg-[#2a1515] px-3 py-2 text-sm text-[#fca5a5]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
