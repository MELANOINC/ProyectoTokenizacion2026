import { jsonOk } from "@/lib/api";
import { getEcosystemStatus } from "@/lib/handoff";
import { ECOSYSTEM } from "@/lib/ecosystem";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getEcosystemStatus();
  return jsonOk({
    ...status,
    links: ECOSYSTEM,
    flow: ["alenya", "luxia", "notorius"] as const,
  });
}
