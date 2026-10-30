import { setTimeout as delay } from "node:timers/promises";

const maxAttempts = 3;
const timeoutMs = 20_000;

export async function checkLink(url, { fetchImpl = fetch, sleep = delay, onRetry = () => {} } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response;
    let problem;
    try {
      response = await fetchImpl(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "User-Agent": "OpenChoices-link-check/0.1" },
      });
      await response.body?.cancel();
    } catch (error) {
      problem = error;
    }

    if (!problem) {
      // Some official sites block automated requests. Keep reporting these separately.
      if (response.status < 400 || response.status === 403) return response.status;

      problem = new Error(`HTTP ${response.status}`);
      if (response.status !== 408 && response.status !== 429 && response.status < 500) throw problem;
    }

    if (attempt === maxAttempts) {
      throw new Error(`${problem.message} (after ${maxAttempts} attempts)`, { cause: problem });
    }

    const delayMs = 1_000 * 2 ** (attempt - 1);
    onRetry({ attempt, maxAttempts, delayMs, error: problem });
    await sleep(delayMs);
  }
}
