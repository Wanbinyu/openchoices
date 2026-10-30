import { readFile } from "node:fs/promises";
import { checkLink } from "./lib/check-link.mjs";

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
      const status = await checkLink(target.url, {
        onRetry: ({ attempt, maxAttempts, delayMs, error }) => console.warn(
          `RETRY ${attempt}/${maxAttempts} ${target.app} ${target.type}: ${error.message}; retrying in ${delayMs}ms ${target.url}`,
        ),
      });
      console.log(`${status === 403 ? "SKIP" : "OK"} ${status} ${target.app} ${target.type}`);
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
