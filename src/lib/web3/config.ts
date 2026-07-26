import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { polygon, polygonAmoy } from "wagmi/chains";

export const supportedChains = [polygonAmoy, polygon] as const;

export const DEFAULT_CHAIN_ID = polygonAmoy.id;

export const chainMeta: Record<
  number,
  { label: string; explorer: string; faucet?: string; native: string }
> = {
  [polygonAmoy.id]: {
    label: "Polygon Amoy",
    explorer: "https://amoy.polygonscan.com",
    faucet: "https://faucet.polygon.technology/",
    native: "MATIC",
  },
  [polygon.id]: {
    label: "Polygon Mainnet",
    explorer: "https://polygonscan.com",
    native: "MATIC",
  },
};

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: "NOTORIUS",
        url: "https://notorius.app",
        iconUrl: "https://notorius.app/favicon.ico",
      },
    }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
    [polygon.id]: http("https://polygon-rpc.com"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
