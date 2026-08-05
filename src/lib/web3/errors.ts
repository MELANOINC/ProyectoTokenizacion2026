export function formatWalletError(error: unknown): string {
  if (!error) return "Error desconocido";

  const anyError = error as {
    shortMessage?: string;
    message?: string;
    name?: string;
    code?: number | string;
    cause?: { code?: number | string; message?: string; shortMessage?: string };
  };

  const code = anyError.code ?? anyError.cause?.code;
  const raw =
    anyError.shortMessage ||
    anyError.cause?.shortMessage ||
    anyError.message ||
    anyError.cause?.message ||
    String(error);

  if (
    code === 4001 ||
    code === "ACTION_REJECTED" ||
    /user rejected|rejected the request|denied/i.test(raw)
  ) {
    return "Firma cancelada en MetaMask.";
  }

  if (/connector not connected|connector already connected/i.test(raw)) {
    return "Reconectá MetaMask e intentá de nuevo.";
  }

  if (
    /provider not found|no injected provider|metamask/i.test(raw) &&
    /not found|install|unavailable/i.test(raw)
  ) {
    return "MetaMask no está disponible. Instalá la extensión e iniciá sesión.";
  }

  if (/unsupported chain|chain mismatch|unrecognized chain/i.test(raw)) {
    return "Red incorrecta. Cambiá a Polygon Amoy o Polygon Mainnet.";
  }

  if (
    /requested resource not available|rpc.*unavailable|could not coalesce|failed to fetch|network error|http request failed/i.test(
      raw,
    )
  ) {
    return "RPC de Polygon no disponible. Recargá la página, verificá que MetaMask esté en Amoy/Mainnet y reintentá el deploy.";
  }

  if (/insufficient funds|gas/i.test(raw)) {
    return "Fondos insuficientes de MATIC para gas en esta red.";
  }

  const onChainCode = raw.match(
    /MISSING_ROLE|NOT_WHITELISTED|NOT_KYC|EXCEEDS_SUPPLY|NOT_OWNER|NOT_COMPLIANCE|UNKNOWN_ROLE|REVOKE_OWNER|ZERO_ADDRESS|ZERO_REGISTRY|ALLOWANCE|BALANCE/,
  )?.[0];
  if (onChainCode) {
    if (onChainCode === "MISSING_ROLE" || onChainCode === "NOT_COMPLIANCE") {
      return "Falta rol on-chain (ADMIN/COMPLIANCE/ISSUER). El deployer recibe todos los roles; usá la misma wallet que desplegó el contrato.";
    }
    return `Requisito on-chain: ${onChainCode}`;
  }

  return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const eth = (
    window as Window & {
      ethereum?: { isMetaMask?: boolean; providers?: { isMetaMask?: boolean }[] };
    }
  ).ethereum;
  if (!eth) return false;
  if (eth.isMetaMask) return true;
  return Boolean(eth.providers?.some((p) => p.isMetaMask));
}
