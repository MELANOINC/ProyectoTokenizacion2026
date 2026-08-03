export const ECOSYSTEM = {
  alenya: {
    name: "aLENYA",
    role: "Capta y califica",
    url: "https://alenya.melanoinc.com",
  },
  luxia: {
    name: "LUXIA",
    role: "Convierte y opera",
    url: "https://luxia.melanoinc.com",
  },
  notorius: {
    name: "NOTORIUS",
    role: "Tokeniza y emite",
    url: "https://notorius.melanoinc.com",
  },
  brunomelano: {
    name: "Bruno Melano CRM",
    role: "Panel comercial",
    url: "https://brunomelano-dusky.vercel.app",
  },
  corporate: {
    name: "Melano Inc",
    role: "Corporate",
    url: "https://melanoinc.com",
  },
} as const;

export type HandoffSource = "alenya" | "luxia" | "brunomelano" | "manual";
