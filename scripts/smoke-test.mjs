import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [html, css, js, manifest, serviceWorker] = await Promise.all(
  ["index.html", "styles.css", "app.js", "manifest.webmanifest", "service-worker.js"].map((path) =>
    readFile(new URL(path, root), "utf8"),
  ),
);

const assertions = [
  [html.includes('id="search-input"'), "index.html includes the search input"],
  [html.includes('id="card-template"'), "index.html includes the result-card template"],
  [html.includes('rel="manifest"'), "index.html links the PWA manifest"],
  [css.includes("@media (max-width: 620px)"), "styles include a narrow mobile layout"],
  [js.includes('fetch("data/catalog.json"'), "app loads the shared catalog"],
  [js.includes("winget install --id"), "install commands are generated locally"],
  [!js.includes("eval("), "app does not use eval"],
  [manifest.includes('"display": "standalone"'), "manifest enables standalone display"],
  [serviceWorker.includes("data/catalog.json"), "service worker caches the catalog"],
];

const failed = assertions.filter(([passed]) => !passed);
for (const [passed, message] of assertions) console.log(`${passed ? "PASS" : "FAIL"} ${message}`);
if (failed.length) process.exit(1);
