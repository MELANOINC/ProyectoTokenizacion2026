"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  type Address,
  type Hex,
  formatUnits,
  isAddress,
  zeroAddress,
} from "viem";
import {
  useAccount,
  useChainId,
  useDeployContract,
  usePublicClient,
  useReadContract,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  identityRegistryAbi,
  identityRegistryBytecode,
  securityTokenAbi,
  securityTokenBytecode,
} from "@/lib/web3/abis";
import {
  buildAgreementDomain,
  buildAgreementMessage,
  tokenizationAgreementTypes,
  type SignedAgreement,
} from "@/lib/web3/agreement";
import { chainMeta } from "@/lib/web3/config";
import { formatWalletError } from "@/lib/web3/errors";
import { safeParseUnits } from "@/lib/web3/parse";
import {
  clearContractSession,
  loadContractSession,
  saveContractSession,
  subscribeContractSession,
  type ContractSession,
} from "@/lib/web3/session";
import { WalletBar } from "@/components/web3/WalletBar";

type StatusTone = "idle" | "ok" | "error" | "pending";

const defaultForm = {
  assetName: "Torre Núñez — Puerto Madero",
  symbol: "TNPM",
  totalSupplyHuman: "1000000",
  investor: "",
  countryCode: "AR",
};

function StatusBanner({
  tone,
  message,
}: {
  tone: StatusTone;
  message: string | null;
}) {
  if (!message) return null;
  const styles =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-900"
      : tone === "ok"
        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
        : tone === "pending"
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-[var(--line)] bg-white/70 text-[var(--ink-soft)]";
  return <p className={`border px-3 py-2 text-sm ${styles}`}>{message}</p>;
}

function explorerTx(chainId: number, hash: string) {
  const base = chainMeta[chainId]?.explorer;
  return base ? `${base}/tx/${hash}` : undefined;
}

function explorerAddress(chainId: number, address: string) {
  const base = chainMeta[chainId]?.explorer;
  return base ? `${base}/address/${address}` : undefined;
}

export function ContractStudio() {
  const saved = useSyncExternalStore(
    subscribeContractSession,
    loadContractSession,
    () => null,
  );

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { deployContractAsync, isPending: isDeploying } = useDeployContract();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

  const [assetName, setAssetName] = useState(defaultForm.assetName);
  const [symbol, setSymbol] = useState(defaultForm.symbol);
  const [totalSupplyHuman, setTotalSupplyHuman] = useState(
    defaultForm.totalSupplyHuman,
  );
  const [investorInput, setInvestorInput] = useState(defaultForm.investor);
  const [countryCode, setCountryCode] = useState(defaultForm.countryCode);
  const [mintAmount, setMintAmount] = useState("1000");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("10");
  const [registryAddress, setRegistryAddress] = useState<Address>();
  const [tokenAddress, setTokenAddress] = useState<Address>();
  const [agreement, setAgreement] = useState<SignedAgreement>();
  const [lastTxHash, setLastTxHash] = useState<Hex>();
  const [status, setStatus] = useState<{ tone: StatusTone; message: string | null }>({
    tone: "idle",
    message: null,
  });
  const [restoredKey, setRestoredKey] = useState<string | null>(null);

  const waiting = useWaitForTransactionReceipt({
    hash: lastTxHash,
    query: { enabled: Boolean(lastTxHash) },
  });

  const investor =
    investorInput && isAddress(investorInput)
      ? investorInput
      : address && isAddress(address)
        ? address
        : "";

  // Restore once from localStorage snapshot (stable via session cache).
  if (saved && restoredKey !== saved.updatedAt) {
    setRestoredKey(saved.updatedAt);
    setAssetName(saved.assetName);
    setSymbol(saved.symbol);
    setTotalSupplyHuman(saved.totalSupplyHuman);
    setInvestorInput(saved.investor);
    setCountryCode(saved.countryCode);
    setRegistryAddress(saved.registryAddress);
    setTokenAddress(saved.tokenAddress);
    setAgreement(saved.agreement);
    setLastTxHash(saved.lastTxHash);
  }

  function persist(partial?: Partial<ContractSession>) {
    if (!address) return;
    const next: ContractSession = {
      chainId,
      assetName,
      symbol,
      totalSupplyHuman,
      investor: (isAddress(investor) ? investor : address) as Address,
      countryCode,
      registryAddress,
      tokenAddress,
      agreement,
      lastTxHash,
      updatedAt: new Date().toISOString(),
      ...partial,
    };
    saveContractSession(next);
    setRestoredKey(next.updatedAt);
  }

  useEffect(() => {
    if (!address) return;
    const handle = window.setTimeout(() => persist(), 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce form edits into session
  }, [
    address,
    chainId,
    assetName,
    symbol,
    totalSupplyHuman,
    investor,
    countryCode,
    registryAddress,
    tokenAddress,
    agreement,
    lastTxHash,
  ]);

  const totalSupplyWei = safeParseUnits(totalSupplyHuman);
  const mintWei = safeParseUnits(mintAmount);
  const transferWei = safeParseUnits(transferAmount);

  const tokenBalance = useReadContract({
    address: tokenAddress,
    abi: securityTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(tokenAddress && address) },
  });

  const mintedSupply = useReadContract({
    address: tokenAddress,
    abi: securityTokenAbi,
    functionName: "mintedSupply",
    query: { enabled: Boolean(tokenAddress) },
  });

  const isVerified = useReadContract({
    address: registryAddress,
    abi: identityRegistryAbi,
    functionName: "isVerified",
    args: investor ? [investor as Address] : undefined,
    query: { enabled: Boolean(registryAddress && investor) },
  });

  const isWhitelisted = useReadContract({
    address: tokenAddress,
    abi: securityTokenAbi,
    functionName: "whitelist",
    args: investor ? [investor as Address] : undefined,
    query: { enabled: Boolean(tokenAddress && investor) },
  });

  const busy = isDeploying || isWriting || isSigning || waiting.isLoading;
  const networkReady =
    isConnected && (chainId === 80002 || chainId === 137) && Boolean(publicClient);

  function setOk(message: string) {
    setStatus({ tone: "ok", message });
  }

  function setPending(message: string) {
    setStatus({ tone: "pending", message });
  }

  function setErr(error: unknown) {
    setStatus({ tone: "error", message: formatWalletError(error) });
  }

  async function ensureReady() {
    if (!isConnected || !address) throw new Error("Conectá MetaMask primero.");
    if (!publicClient) throw new Error("RPC de Polygon no disponible todavía.");
    if (chainId !== 80002 && chainId !== 137) {
      throw new Error("Cambiá a Polygon Amoy o Polygon Mainnet.");
    }
  }

  async function trackTx(hash: Hex, label: string) {
    setLastTxHash(hash);
    setPending(`${label}: esperando confirmación…`);
    const receipt = await publicClient!.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`${label} falló on-chain.`);
    }
    return receipt;
  }

  async function onSignAgreement() {
    try {
      await ensureReady();
      if (!assetName.trim() || !symbol.trim()) {
        throw new Error("Completá nombre y símbolo del activo.");
      }
      if (totalSupplyWei <= BigInt(0)) throw new Error("Supply total inválido.");
      if (!investor || !isAddress(investor)) {
        throw new Error("Wallet del inversor inválida.");
      }

      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const domain = buildAgreementDomain(chainId);
      const message = buildAgreementMessage({
        assetName: assetName.trim(),
        symbol: symbol.trim().toUpperCase(),
        totalSupply: totalSupplyWei,
        issuer: address!,
        investor: investor as Address,
        chainId,
        timestamp,
      });

      setPending("Firmá el acuerdo EIP-712 en MetaMask…");
      const signature = await signTypedDataAsync({
        domain,
        types: tokenizationAgreementTypes,
        primaryType: "TokenizationAgreement",
        message,
      });

      setAgreement({
        signature,
        message,
        domain,
        signedAt: new Date().toISOString(),
      });
      setOk("Acuerdo tokenizado firmado con MetaMask.");
    } catch (error) {
      setErr(error);
    }
  }

  async function onDeployRegistry() {
    try {
      await ensureReady();
      if (!agreement) {
        throw new Error("Firmá el acuerdo EIP-712 antes de desplegar.");
      }
      setPending("Desplegando IdentityRegistry — confirmá en MetaMask…");
      const hash = await deployContractAsync({
        abi: identityRegistryAbi,
        bytecode: identityRegistryBytecode,
        args: [],
        chainId,
      });
      const receipt = await trackTx(hash, "IdentityRegistry");
      if (!receipt.contractAddress) {
        throw new Error("No se obtuvo la dirección del IdentityRegistry.");
      }
      setRegistryAddress(receipt.contractAddress);
      setOk(`IdentityRegistry desplegado: ${receipt.contractAddress}`);
    } catch (error) {
      setErr(error);
    }
  }

  async function onDeployToken() {
    try {
      await ensureReady();
      if (!registryAddress) {
        throw new Error("Desplegá primero el IdentityRegistry.");
      }
      setPending("Desplegando SecurityToken — confirmá en MetaMask…");
      const hash = await deployContractAsync({
        abi: securityTokenAbi,
        bytecode: securityTokenBytecode,
        args: [
          assetName.trim(),
          symbol.trim().toUpperCase(),
          totalSupplyWei,
          registryAddress,
        ],
        chainId,
      });
      const receipt = await trackTx(hash, "SecurityToken");
      if (!receipt.contractAddress) {
        throw new Error("No se obtuvo la dirección del SecurityToken.");
      }
      setTokenAddress(receipt.contractAddress);
      setOk(`SecurityToken desplegado: ${receipt.contractAddress}`);
    } catch (error) {
      setErr(error);
    }
  }

  async function onRegisterIdentity() {
    try {
      await ensureReady();
      if (!registryAddress) throw new Error("Falta IdentityRegistry.");
      if (!investor || !isAddress(investor)) throw new Error("Wallet inversor inválida.");
      if (!countryCode.trim()) throw new Error("Indicá código de país (ej. AR).");

      setPending("Registrando identidad KYC — confirmá en MetaMask…");
      const hash = await writeContractAsync({
        address: registryAddress,
        abi: identityRegistryAbi,
        functionName: "registerIdentity",
        args: [investor as Address, countryCode.trim().toUpperCase()],
        chainId,
      });
      await trackTx(hash, "registerIdentity");
      await isVerified.refetch();
      setOk(`Identidad verificada para ${investor}`);
    } catch (error) {
      setErr(error);
    }
  }

  async function onWhitelist() {
    try {
      await ensureReady();
      if (!tokenAddress) throw new Error("Falta SecurityToken.");
      if (!investor || !isAddress(investor)) throw new Error("Wallet inversor inválida.");

      setPending("Whitelist on-chain — confirmá en MetaMask…");
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: securityTokenAbi,
        functionName: "setWhitelisted",
        args: [investor as Address, true],
        chainId,
      });
      await trackTx(hash, "setWhitelisted");
      await isWhitelisted.refetch();
      setOk(`Wallet whitelistada: ${investor}`);
    } catch (error) {
      setErr(error);
    }
  }

  async function onMint() {
    try {
      await ensureReady();
      if (!tokenAddress) throw new Error("Falta SecurityToken.");
      if (!investor || !isAddress(investor)) throw new Error("Wallet inversor inválida.");
      if (mintWei <= BigInt(0)) throw new Error("Cantidad de mint inválida.");

      setPending("Mint de tokens — confirmá en MetaMask…");
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: securityTokenAbi,
        functionName: "mint",
        args: [investor as Address, mintWei],
        chainId,
      });
      await trackTx(hash, "mint");
      await Promise.all([tokenBalance.refetch(), mintedSupply.refetch()]);
      setOk(`Mint OK: ${mintAmount} ${symbol.toUpperCase()}`);
    } catch (error) {
      setErr(error);
    }
  }

  async function onTransfer() {
    try {
      await ensureReady();
      if (!tokenAddress) throw new Error("Falta SecurityToken.");
      if (!transferTo || !isAddress(transferTo)) {
        throw new Error("Wallet destino inválida.");
      }
      if (transferWei <= BigInt(0)) throw new Error("Cantidad de transfer inválida.");

      setPending("Transferencia controlada — confirmá en MetaMask…");
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: securityTokenAbi,
        functionName: "transfer",
        args: [transferTo as Address, transferWei],
        chainId,
      });
      await trackTx(hash, "transfer");
      await tokenBalance.refetch();
      setOk(`Transfer OK a ${transferTo}`);
    } catch (error) {
      setErr(error);
    }
  }

  function onReset() {
    clearContractSession();
    setRegistryAddress(undefined);
    setTokenAddress(undefined);
    setAgreement(undefined);
    setLastTxHash(undefined);
    setStatus({ tone: "idle", message: "Sesión local reiniciada." });
  }

  const steps = [
    { id: 1, label: "Firmar acuerdo", done: Boolean(agreement) },
    { id: 2, label: "Deploy registry", done: Boolean(registryAddress) },
    { id: 3, label: "Deploy token", done: Boolean(tokenAddress) },
    { id: 4, label: "KYC on-chain", done: Boolean(isVerified.data) },
    { id: 5, label: "Whitelist", done: Boolean(isWhitelisted.data) },
    {
      id: 6,
      label: "Mint",
      done: Boolean(mintedSupply.data && (mintedSupply.data as bigint) > BigInt(0)),
    },
  ];

  return (
    <div className="space-y-8">
      <WalletBar />

      <section className="panel p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--slate)] uppercase">
          Pipeline on-chain
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`border px-3 py-3 text-sm ${
                step.done
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : "border-[var(--line)] text-[var(--ink-soft)]"
              }`}
            >
              <span className="font-[family-name:var(--font-display)] font-semibold">
                {String(step.id).padStart(2, "0")}
              </span>{" "}
              {step.label}
            </li>
          ))}
        </ol>
      </section>

      <StatusBanner tone={status.tone} message={status.message} />

      {!networkReady ? (
        <p className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Conectá MetaMask y seleccioná <strong>Polygon Amoy</strong> (recomendado)
          o <strong>Polygon Mainnet</strong> para habilitar despliegue y firma.
        </p>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            1. Datos del activo
          </h2>
          <div className="panel space-y-3 p-5">
            <Field label="Nombre del activo">
              <input
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="field"
              />
            </Field>
            <Field label="Símbolo">
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="field"
              />
            </Field>
            <Field label="Supply total (human, 18 decimals)">
              <input
                value={totalSupplyHuman}
                onChange={(e) => setTotalSupplyHuman(e.target.value)}
                className="field"
                inputMode="decimal"
              />
            </Field>
            <Field label="Wallet inversor">
              <input
                value={investorInput || address || ""}
                onChange={(e) => setInvestorInput(e.target.value)}
                className="field font-mono text-sm"
                placeholder={address ?? zeroAddress}
              />
            </Field>
            <Field label="País KYC (ISO)">
              <input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                className="field"
                maxLength={4}
              />
            </Field>
            <button
              type="button"
              disabled={!networkReady || busy}
              onClick={onSignAgreement}
              className="btn-primary"
            >
              {isSigning ? "Firmando…" : "Firmar acuerdo EIP-712"}
            </button>
            {agreement ? (
              <p className="break-all text-xs text-[var(--slate)]">
                Firma: {agreement.signature}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            2. Desplegar contratos
          </h2>
          <div className="panel space-y-3 p-5">
            <button
              type="button"
              disabled={!networkReady || busy || !agreement}
              onClick={onDeployRegistry}
              className="btn-primary w-full"
            >
              {isDeploying ? "Desplegando…" : "Deploy IdentityRegistry"}
            </button>
            <button
              type="button"
              disabled={!networkReady || busy || !registryAddress}
              onClick={onDeployToken}
              className="btn-primary w-full"
            >
              Deploy SecurityToken
            </button>
            <AddressLine
              label="Registry"
              address={registryAddress}
              chainId={chainId}
            />
            <AddressLine
              label="Token"
              address={tokenAddress}
              chainId={chainId}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            3. KYC + Whitelist + Mint
          </h2>
          <div className="panel space-y-3 p-5">
            <p className="text-sm text-[var(--ink-soft)]">
              KYC: {isVerified.data ? "verificado" : "pendiente"} · Whitelist:{" "}
              {isWhitelisted.data ? "sí" : "no"} · Minted:{" "}
              {mintedSupply.data
                ? formatUnits(mintedSupply.data as bigint, 18)
                : "0"}{" "}
              · Tu balance:{" "}
              {tokenBalance.data
                ? formatUnits(tokenBalance.data as bigint, 18)
                : "0"}
            </p>
            <button
              type="button"
              disabled={!networkReady || busy || !registryAddress}
              onClick={onRegisterIdentity}
              className="btn-primary w-full"
            >
              Registrar identidad (KYC)
            </button>
            <button
              type="button"
              disabled={!networkReady || busy || !tokenAddress}
              onClick={onWhitelist}
              className="btn-primary w-full"
            >
              Whitelist inversor
            </button>
            <Field label="Cantidad a mintear">
              <input
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="field"
                inputMode="decimal"
              />
            </Field>
            <button
              type="button"
              disabled={!networkReady || busy || !tokenAddress}
              onClick={onMint}
              className="btn-primary w-full"
            >
              Mint tokens
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            4. Transferencia controlada
          </h2>
          <div className="panel space-y-3 p-5">
            <p className="text-sm text-[var(--ink-soft)]">
              Ambas wallets deben estar verificadas y whitelistadas. Destino
              también necesita KYC + whitelist previos.
            </p>
            <Field label="Wallet destino">
              <input
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="field font-mono text-sm"
                placeholder="0x…"
              />
            </Field>
            <Field label="Cantidad">
              <input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="field"
                inputMode="decimal"
              />
            </Field>
            <button
              type="button"
              disabled={!networkReady || busy || !tokenAddress}
              onClick={onTransfer}
              className="btn-primary w-full"
            >
              Firmar y transferir
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] hover:border-[var(--ink)]"
            >
              Reiniciar sesión local
            </button>
          </div>
        </div>
      </section>

      {lastTxHash ? (
        <p className="text-sm text-[var(--slate)]">
          Última tx:{" "}
          <a
            href={explorerTx(chainId, lastTxHash)}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[var(--brass)] underline-offset-2"
          >
            {lastTxHash.slice(0, 12)}…
          </a>
          {waiting.isLoading ? " (confirmando…)" : null}
          {waiting.isSuccess ? " (confirmada)" : null}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function AddressLine({
  label,
  address,
  chainId,
}: {
  label: string;
  address?: Address;
  chainId: number;
}) {
  if (!address) {
    return <p className="text-sm text-[var(--slate)]">{label}: pendiente</p>;
  }
  const href = explorerAddress(chainId, address);
  return (
    <p className="break-all text-sm text-[var(--ink-soft)]">
      {label}:{" "}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[var(--brass)] underline-offset-2"
        >
          {address}
        </a>
      ) : (
        address
      )}
    </p>
  );
}
