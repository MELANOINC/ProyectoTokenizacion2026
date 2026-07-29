import { jsonOk } from "@/lib/api";
import { probeIntegrations } from "@/lib/integrations";

export async function GET() {
  const report = await probeIntegrations();
  return jsonOk(report, report.appVerdict === "GREEN" ? 200 : 503);
}
