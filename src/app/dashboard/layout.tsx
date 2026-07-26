import type { ReactNode } from "react";
import { Web3Provider } from "@/components/web3/Web3Provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}
