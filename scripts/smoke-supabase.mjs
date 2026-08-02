import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  process.env[line.slice(0, i)] = line.slice(i + 1);
}
delete process.env.NOTORIUS_STORE;
process.env.NODE_ENV = "development";

const { getPersistenceMode, getSnapshot } = await import(
  pathToFileURL(resolve("src/lib/store.ts")).href
);

console.log("mode", getPersistenceMode());
const snap = await getSnapshot();
console.log(
  JSON.stringify(
    {
      assets: snap.assets.length,
      investors: snap.investors.length,
      mints: snap.mints.length,
      assetId: snap.assets[0]?.id ?? null,
      investorId: snap.investors[0]?.id ?? null,
    },
    null,
    2,
  ),
);
