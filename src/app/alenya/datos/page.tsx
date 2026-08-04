import type { Metadata } from "next";
import { AlenyaShell } from "@/components/alenya/AlenyaShell";
import { DatosPanel } from "@/components/alenya/DatosPanel";
import { fetchPanelKnowledge } from "@/lib/alenya/data";
import type { AlenyaKnowledge } from "@/lib/alenya/types";

export const metadata: Metadata = {
  title: "Datos · aLENYA Command Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AlenyaDatosPage() {
  let items: AlenyaKnowledge[] = [];
  try {
    items = await fetchPanelKnowledge();
  } catch {
    items = [];
  }
  return (
    <AlenyaShell nav="panel">
      <main>
        <DatosPanel initialItems={items} />
      </main>
    </AlenyaShell>
  );
}
