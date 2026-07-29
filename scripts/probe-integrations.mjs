#!/usr/bin/env node
/**
 * Safe, non-destructive integration probes.
 * Loads `.env.local` overrides (gitignored) on top of process.env so local
 * CRM-MELANIA credentials can win over stale cloud secrets.
 *
 * Run via: npm run probe:integrations  (uses tsx)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

function loadEnvLocalOverrides() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocalOverrides();

const { probeIntegrations } = await import(
  pathToFileURL(resolve(process.cwd(), "src/lib/integrations.ts")).href
);

const report = await probeIntegrations();
console.log(JSON.stringify(report, null, 2));
if (report.appVerdict !== "GREEN") process.exit(1);
