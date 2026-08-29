import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [html, css, js, manifest, serviceWorker, catalogScript] = await Promise.all(
  ["index.html", "styles.css", "app.js", "manifest.webmanifest", "service-worker.js", "data/catalog.js"].map((path) =>
    readFile(new URL(path, root), "utf8"),
  ),
);

const assertions = [
  [html.includes('id="search-input"'), "index.html includes the search input"],
  [html.includes('id="card-template"'), "index.html includes the result-card template"],
  [html.includes('rel="manifest"'), "index.html links the PWA manifest"],
  [css.includes("@media (max-width: 620px)"), "styles include a narrow mobile layout"],
  [html.includes('src="data/catalog.js?v=1"'), "index includes the file-compatible catalog script"],
  [html.includes('src="app.js?v=3"') && !html.includes('type="module"'), "app script can run from file URLs"],
  [js.includes("window.OPENCHOICES_CATALOG"), "app prefers the embedded browser catalog"],
  [js.includes("app.aliases ?? []"), "search includes optional aliases"],
  [js.includes('fetch("data/catalog.json"'), "app retains the JSON network fallback"],
  [catalogScript.includes("window.OPENCHOICES_CATALOG ="), "generated catalog exposes browser data"],
  [js.includes("winget install --id"), "install commands are generated locally"],
  [!js.includes("eval("), "app does not use eval"],
  [manifest.includes('"display": "standalone"'), "manifest enables standalone display"],
  [serviceWorker.includes("data/catalog.json"), "service worker caches the catalog"],
];

const failed = assertions.filter(([passed]) => !passed);
for (const [passed, message] of assertions) console.log(`${passed ? "PASS" : "FAIL"} ${message}`);
if (failed.length) process.exit(1);
