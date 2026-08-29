import { readFile, writeFile } from "node:fs/promises";

const catalogUrl = new URL("../data/catalog.json", import.meta.url);
const outputUrl = new URL("../data/catalog.js", import.meta.url);
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const generated = [
  "// Generated from data/catalog.json. Run `npm run generate` after editing the catalog.",
  `window.OPENCHOICES_CATALOG = ${JSON.stringify(catalog, null, 2)};`,
  "",
].join("\n");

if (process.argv.includes("--check")) {
  let existing = "";
  try {
    existing = await readFile(outputUrl, "utf8");
  } catch {
    console.error("data/catalog.js is missing. Run `npm run generate`.");
    process.exit(1);
  }
  if (existing.replace(/\r\n/g, "\n") !== generated) {
    console.error("data/catalog.js is out of date. Run `npm run generate`.");
    process.exit(1);
  }
  console.log("Generated browser catalog is up to date.");
} else {
  await writeFile(outputUrl, generated, "utf8");
  console.log(`Generated data/catalog.js with ${catalog.apps.length} apps.`);
}
