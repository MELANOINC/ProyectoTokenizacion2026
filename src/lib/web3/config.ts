import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { polygon } from "wagmi/chains";

// Production policy: NOTORIUS operates on Polygon Mainnet only.
export const supportedChains = [polygon] as const;

export const DEFAULT_CHAIN_ID = polygon.id;

export const chainMeta: Record<
  number,
  { label: string; explorer: string; native: string }
> = {
  [polygon.id]: {
    label: "Polygon Mainnet",
    explorer: "https://polygonscan.com",
    native: "POL",
  },
};

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: "NOTORIUS",
        url:
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
          ["https://notorius", "melanoinc.com"].join("."),
        iconUrl: `${
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
          ["https://notorius", "melanoinc.com"].join(".")
        }/icon-192.png`,
      },
    }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [polygon.id]: http("https://polygon-rpc.com"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
