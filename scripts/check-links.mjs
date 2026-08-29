import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
const targets = catalog.apps.flatMap((app) => [
  { app: app.name, type: "website", url: app.website },
  { app: app.name, type: "repository", url: app.repository },
]);
const failures = [];
let cursor = 0;

async function worker() {
  while (cursor < targets.length) {
    const target = targets[cursor++];
    try {
      const response = await fetch(target.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { "User-Agent": "OpenChoices-link-check/0.1" },
      });
      if (response.status >= 400 && response.status !== 403 && response.status !== 429) {
        failures.push(`${target.app} ${target.type}: HTTP ${response.status} ${target.url}`);
      } else {
        console.log(`OK ${response.status} ${target.app} ${target.type}`);
      }
      await response.body?.cancel();
    } catch (error) {
      failures.push(`${target.app} ${target.type}: ${error.message} ${target.url}`);
    }
  }
}

await Promise.all(Array.from({ length: 5 }, worker));
if (failures.length) {
  console.error(`Link check found ${failures.length} problem(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Link check passed for ${targets.length} URLs.`);
