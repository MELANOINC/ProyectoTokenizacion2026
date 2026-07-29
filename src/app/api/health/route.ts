import { jsonOk } from "@/lib/api";

export async function GET() {
  return jsonOk({
    service: "notorius",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
