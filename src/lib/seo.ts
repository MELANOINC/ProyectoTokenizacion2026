import type { Metadata } from "next";

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
export const SITE_BRAND = "NOTORIUS™";
export const SITE_ORG = "Melano Inc";

/** ~55–60 chars — primary SERP title */
export const SITE_TITLE =
  "NOTORIUS — Tokenización de propiedades y RWA | Melano Inc";

/** ~155 chars — primary meta description */
export const SITE_DESCRIPTION =
  "Tokenizá propiedades y activos reales en Polygon: firma EIP-712, KYC, whitelist, mint y transferencias controladas. Hub Melano: Alenya capta, Luxia convierte, NOTORIUS tokeniza.";

export const SITE_TAGLINE =
  "Agente tokenizador de propiedades y activos reales para inmobiliarias y emisores.";

export const OG_TITLE = "NOTORIUS — Agente tokenizador | Melano Inc";

export const OG_DESCRIPTION =
  "Del deed al security token en Polygon. Smart contracts, KYC on-chain, whitelist y emisión controlada.";

export const OG_IMAGE_PATH = "/og-notorius.png";
export const OG_IMAGE_ALT =
  "NOTORIUS — tokenización de propiedades y activos reales | Melano Inc";

export const SITE_KEYWORDS = [
  "NOTORIUS",
  "tokenización inmobiliaria",
  "tokenizacion de propiedades",
  "security token",
  "RWA",
  "real world assets",
  "activos tokenizados",
  "Polygon",
  "MetaMask",
  "smart contracts",
  "ERC-3643",
  "KYC",
  "whitelist",
  "Melano Inc",
  "Luxia",
  "Alenya",
  "Argentina",
  "inmobiliarias",
] as const;

const MELANO_HOME = ["https://melanoinc", "com"].join(".");
const LUXIA_HOME = ["https://luxia", "melanoinc.com"].join(".");
const ALENYA_HOME = ["https://alenya", "melanoinc.com"].join(".");

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const OG_IMAGE = {
  url: absoluteUrl(OG_IMAGE_PATH),
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
  type: "image/png" as const,
};

/** Shared metadata builder for inner pages. */
export function buildPageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        "es-AR": path,
        es: path,
        "x-default": path,
      },
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: {
        url: OG_IMAGE.url,
        alt: OG_IMAGE.alt,
      },
    },
    robots: index
      ? { index: true, follow: true }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${MELANO_HOME}/#organization`,
    name: SITE_ORG,
    url: MELANO_HOME,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-512.png"),
      width: 512,
      height: 512,
    },
    sameAs: [LUXIA_HOME, ALENYA_HOME, SITE_URL],
    brand: {
      "@type": "Brand",
      name: SITE_BRAND,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: [SITE_BRAND, "NOTORIUS Melano"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-AR",
    publisher: {
      "@type": "Organization",
      name: SITE_ORG,
      url: MELANO_HOME,
    },
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_BRAND,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Tokenization Platform",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: absoluteUrl(OG_IMAGE_PATH),
    featureList: [
      "Firma EIP-712",
      "IdentityRegistry + SecurityToken (ERC-3643 style)",
      "KYC y whitelist on-chain",
      "Mint y transferencias controladas en Polygon",
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/OnlineOnly",
      priceCurrency: "USD",
      category: "SaaS",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_ORG,
      url: MELANO_HOME,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_ORG,
      url: MELANO_HOME,
    },
  };
}

export function webPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: "es-AR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#software` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(OG_IMAGE_PATH),
      width: 1200,
      height: 630,
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es NOTORIUS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NOTORIUS es el agente tokenizador de Melano Inc: convierte propiedades y activos reales en security tokens con smart contracts, KYC, whitelist y emisión controlada en Polygon.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo se integra con Luxia y Alenya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En el hub Melano, Alenya capta y califica leads, Luxia opera la conversión comercial y NOTORIUS tokeniza el activo con el mismo estándar operativo.",
        },
      },
      {
        "@type": "Question",
        name: "¿En qué red opera NOTORIUS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NOTORIUS despliega IdentityRegistry y SecurityToken (estilo ERC-3643) en Polygon, con firma MetaMask (EIP-712) antes del deploy.",
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
