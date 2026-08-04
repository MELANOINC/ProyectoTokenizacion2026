import { jsonOk } from "@/lib/api";
import { getPersistenceMode } from "@/lib/store";

export async function GET() {
  return jsonOk({
    service: "notorius",
    status: "healthy",
    persistence: getPersistenceMode(),
    timestamp: new Date().toISOString(),
  });
}
