import assert from "node:assert/strict";
import { test } from "node:test";

import { verifyNpmPublication } from "./verify-npm-publication.mjs";

const metadata = {
  dist: {
    integrity: "sha512-test",
    tarball: "https://registry.npmjs.org/create-tsu-stack/-/create-tsu-stack-1.2.3.tgz"
  },
  name: "create-tsu-stack",
  version: "1.2.3"
};

test("bypasses a cached 404 and verifies complete package metadata", async () => {
  const requests = [];
  const warnings = [];
  let fetchCount = 0;
  let sleepCount = 0;

  const result = await verifyNpmPublication({
    attempts: 3,
    delayMs: 1,
    fetchImpl: async (url, options) => {
      requests.push({ options, url: String(url) });
      fetchCount += 1;
      if (fetchCount === 1) return new Response("cached miss", { status: 404 });
      return Response.json(metadata);
    },
    log: {
      log() {},
      warn(message) {
        warnings.push(message);
      }
    },
    now: () => 123,
    packageName: "create-tsu-stack",
    sleep: async () => {
      sleepCount += 1;
    },
    version: "1.2.3"
  });

  assert.equal(result.version, "1.2.3");
  assert.equal(sleepCount, 1);
  assert.equal(warnings.length, 1);
  assert.match(requests[0].url, /cache-bust=123-1/u);
  assert.match(requests[1].url, /cache-bust=123-2/u);
  assert.equal(requests[0].options.headers["cache-control"], "no-cache, no-store, max-age=0");
});

test("retries transient network failures", async () => {
  let fetchCount = 0;

  await verifyNpmPublication({
    attempts: 2,
    delayMs: 0,
    fetchImpl: async () => {
      fetchCount += 1;
      if (fetchCount === 1) throw new Error("temporary network failure");
      return Response.json(metadata);
    },
    log: { log() {}, warn() {} },
    packageName: "create-tsu-stack",
    sleep: async () => {},
    version: "1.2.3"
  });

  assert.equal(fetchCount, 2);
});

test("fails when npm never returns the expected complete metadata", async () => {
  await assert.rejects(
    verifyNpmPublication({
      attempts: 2,
      delayMs: 0,
      fetchImpl: async () => Response.json({ ...metadata, version: "1.2.2" }),
      log: { log() {}, warn() {} },
      packageName: "create-tsu-stack",
      sleep: async () => {},
      version: "1.2.3"
    }),
    /after 2 attempts.*instead of create-tsu-stack@1\.2\.3/u
  );
});
