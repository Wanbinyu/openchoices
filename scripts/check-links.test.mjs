import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkLink } from "./lib/check-link.mjs";

function scenario(outcomes) {
  const calls = [];
  const waits = [];
  const retries = [];
  let cancelled = 0;
  const options = {
    fetchImpl: async (url, request) => {
      calls.push({ url, request });
      assert.ok(outcomes.length, "unexpected extra request");
      const outcome = outcomes.shift();
      if (outcome instanceof Error) throw outcome;
      return { status: outcome, body: { cancel: async () => { cancelled++; } } };
    },
    sleep: async (ms) => { waits.push(ms); },
    onRetry: (retry) => { retries.push(retry); },
  };
  return { calls, waits, retries, options, cancelled: () => cancelled };
}

test("a healthy URL succeeds without retrying and releases the response body", async () => {
  const s = scenario([200]);
  assert.equal(await checkLink("https://example.com/", s.options), 200);
  assert.equal(s.calls.length, 1);
  assert.equal(s.cancelled(), 1);
  assert.deepEqual(s.waits, []);
  assert.equal(s.calls[0].request.redirect, "follow");
  assert.ok(s.calls[0].request.signal instanceof AbortSignal);
});

test("timeouts and connection failures recover with backoff and fresh timeout signals", async () => {
  const s = scenario([new DOMException("request timed out", "TimeoutError"), new TypeError("fetch failed"), 200]);
  assert.equal(await checkLink("https://example.com/", s.options), 200);
  assert.equal(s.calls.length, 3);
  assert.equal(new Set(s.calls.map(({ request }) => request.signal)).size, 3);
  assert.deepEqual(s.waits, [1_000, 2_000]);
  assert.deepEqual(s.retries.map(({ attempt, maxAttempts }) => [attempt, maxAttempts]), [[1, 3], [2, 3]]);
});

for (const status of [408, 429, 500, 502, 503, 504]) {
  test(`HTTP ${status} is retried and can recover`, async () => {
    const s = scenario([status, 200]);
    assert.equal(await checkLink("https://example.com/", s.options), 200);
    assert.equal(s.cancelled(), 2);
    assert.deepEqual(s.waits, [1_000]);
  });
}

for (const status of [400, 401, 404, 410]) {
  test(`HTTP ${status} fails immediately`, async () => {
    const s = scenario([status]);
    await assert.rejects(checkLink("https://example.com/", s.options), { message: `HTTP ${status}` });
    assert.equal(s.calls.length, 1);
    assert.equal(s.cancelled(), 1);
    assert.deepEqual(s.waits, []);
  });
}

test("HTTP 403 retains the existing automated-access exception without retrying", async () => {
  const s = scenario([403]);
  assert.equal(await checkLink("https://example.com/", s.options), 403);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.waits, []);
});

for (const outcome of [new DOMException("request timed out", "TimeoutError"), 429, 503]) {
  test(`persistent ${outcome.message ?? outcome} fails after exactly three attempts`, async () => {
    const s = scenario([outcome, outcome, outcome]);
    await assert.rejects(checkLink("https://example.com/", s.options), /after 3 attempts/);
    assert.equal(s.calls.length, 3);
    assert.deepEqual(s.waits, [1_000, 2_000]);
  });
}

// Exercise the real CLI and exit code without contacting any external website.
function runChecker(failureStatus) {
  const preload = `
    let calls = 0;
    globalThis.fetch = async () => {
      const status = ${failureStatus} && calls++ === 0 ? ${failureStatus} : 200;
      return { status, body: { cancel: async () => {} } };
    };
  `;
  const result = spawnSync(process.execPath, [
    "--import", `data:text/javascript,${encodeURIComponent(preload)}`,
    fileURLToPath(new URL("check-links.mjs", import.meta.url)),
  ], { encoding: "utf8", timeout: 10_000 });
  assert.ifError(result.error);
  return result;
}

test("CLI reports recovered transient failures and exits successfully", () => {
  const result = runChecker(503);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /RETRY 1\/3/);
  assert.match(result.stdout, /Link check passed for 200 URLs/);
});

test("CLI keeps a permanent broken link in the failure summary and exits unsuccessfully", () => {
  const result = runChecker(404);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /Link check found 1 problem/);
  assert.match(result.stderr, /GIMP website: HTTP 404 https:\/\/www.gimp.org\//);
  assert.doesNotMatch(result.stdout, /Link check passed/);
});
