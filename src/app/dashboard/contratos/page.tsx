import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ContractStudio } from "@/components/web3/ContractStudio";

export const dynamic = "force-dynamic";

export default function ContratosPage() {
  return (
    <DashboardShell
      title="Contratos tokenizados"
      subtitle="Conectá MetaMask en Polygon, firmá el acuerdo EIP-712 y desplegá IdentityRegistry + SecurityToken (Solidity) para emitir y transferir con whitelist/KYC."
    >
      <ContractStudio />
    </DashboardShell>
  );
}
