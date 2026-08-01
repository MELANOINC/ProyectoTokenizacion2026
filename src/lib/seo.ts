function envUrl(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value.replace(/\/$/, "");
  }
  return undefined;
}

/** Production canonical host for NOTORIUS. */
export const SITE_URL =
  envUrl("NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_BASE_URL") ??
  ["https://notorius", "melanoinc.com"].join(".");

export const SITE_NAME = "NOTORIUS";

export const SITE_TITLE =
  "NOTORIUS — Agente tokenizador de propiedades y activos | Melano Inc";

export const SITE_DESCRIPTION =
  "Tokenizá propiedades y activos reales con smart contracts, KYC, whitelist y emisión controlada en Polygon. Hub Melano: Alenya capta, Luxia convierte, NOTORIUS tokeniza.";

export const SITE_TAGLINE =
  "Smart Contract Engine + Tokenization Platform para inmobiliarias y emisores.";

export const SITE_KEYWORDS = [
  "NOTORIUS",
  "tokenización",
  "tokenizacion inmobiliaria",
  "security token",
  "RWA",
  "real world assets",
  "Polygon",
  "MetaMask",
  "smart contracts",
  "KYC",
  "whitelist",
  "Melano Inc",
  "Luxia",
  "Alenya",
  "Argentina",
] as const;

const MELANO_HOME = ["https://melanoinc", "com"].join(".");
const LUXIA_HOME = ["https://luxia", "melanoinc.com"].join(".");
const ALENYA_HOME = ["https://alenya", "melanoinc.com"].join(".");

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Melano Inc",
    url: MELANO_HOME,
    logo: absoluteUrl("/icon-512.png"),
    sameAs: [LUXIA_HOME, ALENYA_HOME, SITE_URL],
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: absoluteUrl("/og-notorius.png"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "Melano Inc",
      url: MELANO_HOME,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-AR",
    publisher: {
      "@type": "Organization",
      name: "Melano Inc",
    },
  };
}
