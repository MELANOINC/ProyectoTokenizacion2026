import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Web3Provider } from "@/components/web3/Web3Provider";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}
