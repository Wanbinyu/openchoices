import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
const errors = [];
const allowedProviders = new Set(["winget"]);
const requiredStringFields = [
  "id",
  "name",
  "description",
  "category",
  "license",
  "repository",
  "website",
  "verifiedAt",
];

if (catalog.metadata?.schemaVersion !== 1) errors.push("metadata.schemaVersion must be 1");
if (!Array.isArray(catalog.apps) || catalog.apps.length === 0) errors.push("apps must be a non-empty array");

const ids = new Set();
const packageIds = new Set();
for (const [index, app] of (catalog.apps ?? []).entries()) {
  const prefix = `apps[${index}]`;
  for (const field of requiredStringFields) {
    if (typeof app[field] !== "string" || !app[field].trim()) {
      errors.push(`${prefix}.${field} must be a non-empty string`);
    }
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(app.id ?? "")) errors.push(`${prefix}.id has an invalid format`);
  if (ids.has(app.id)) errors.push(`${prefix}.id duplicates ${app.id}`);
  ids.add(app.id);

  for (const field of ["alternativeTo", "tags", "platforms"]) {
    if (!Array.isArray(app[field]) || app[field].length === 0) {
      errors.push(`${prefix}.${field} must be a non-empty array`);
    } else if (app[field].some((value) => typeof value !== "string" || !value.trim())) {
      errors.push(`${prefix}.${field} may contain only non-empty strings`);
    }
  }
  if (app.aliases !== undefined) {
    if (!Array.isArray(app.aliases)) {
      errors.push(`${prefix}.aliases must be an array when provided`);
    } else if (app.aliases.some((value) => typeof value !== "string" || !value.trim())) {
      errors.push(`${prefix}.aliases may contain only non-empty strings`);
    }
  }

  for (const field of ["repository", "website"]) {
    try {
      const url = new URL(app[field]);
      if (url.protocol !== "https:") errors.push(`${prefix}.${field} must use HTTPS`);
      if (url.username || url.password) errors.push(`${prefix}.${field} must not include credentials`);
    } catch {
      errors.push(`${prefix}.${field} is not a valid URL`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(app.verifiedAt ?? "")) {
    errors.push(`${prefix}.verifiedAt must use YYYY-MM-DD`);
  }
  if (typeof app.verified !== "boolean") errors.push(`${prefix}.verified must be boolean`);
  if (!Number.isInteger(app.rank) || app.rank < 1) errors.push(`${prefix}.rank must be a positive integer`);

  if (app.install) {
    const keys = Object.keys(app.install).sort().join(",");
    if (keys !== "packageId,provider") {
      errors.push(`${prefix}.install may only contain packageId and provider`);
    }
    if (!allowedProviders.has(app.install.provider)) {
      errors.push(`${prefix}.install.provider is not allowed`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._+-]+$/.test(app.install.packageId ?? "")) {
      errors.push(`${prefix}.install.packageId has an invalid format`);
    }
    if (packageIds.has(app.install.packageId)) {
      errors.push(`${prefix}.install.packageId duplicates ${app.install.packageId}`);
    }
    packageIds.add(app.install.packageId);
  }

  const serialized = JSON.stringify(app).toLocaleLowerCase();
  for (const forbidden of ["powershell", "cmd.exe", "bash -c", "curl ", "wget ", "javascript:"]) {
    if (serialized.includes(forbidden)) errors.push(`${prefix} contains forbidden executable content: ${forbidden}`);
  }
}

if (errors.length) {
  console.error(`Catalog validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Catalog validation passed: ${catalog.apps.length} apps, ${packageIds.size} controlled install IDs.`);
