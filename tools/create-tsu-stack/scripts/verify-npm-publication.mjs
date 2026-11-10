import { pathToFileURL } from "node:url";

const DEFAULT_REGISTRY = "https://registry.npmjs.org";

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function verifyNpmPublication({
  attempts = 12,
  delayMs = 10_000,
  fetchImpl = fetch,
  log = console,
  now = Date.now,
  packageName,
  registry = DEFAULT_REGISTRY,
  requestTimeoutMs = 15_000,
  sleep = wait,
  version
}) {
  if (!packageName || !version) throw new Error("Package name and version are required.");
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error("Attempts must be a positive integer.");

  const registryUrl = new URL(registry.endsWith("/") ? registry : `${registry}/`);
  const endpoint = new URL(`${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`, registryUrl);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const url = new URL(endpoint);
    url.searchParams.set("cache-bust", `${now()}-${attempt}`);

    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: "application/json",
          "cache-control": "no-cache, no-store, max-age=0",
          pragma: "no-cache"
        },
        signal: AbortSignal.timeout(requestTimeoutMs)
      });
      const body = await response.text();

      if (!response.ok) {
        throw new Error(`npm registry returned HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
      }

      const metadata = JSON.parse(body);
      if (metadata.name !== packageName || metadata.version !== version) {
        throw new Error(
          `npm registry returned ${String(metadata.name)}@${String(metadata.version)} instead of ${packageName}@${version}`
        );
      }
      if (!metadata.dist?.tarball || (!metadata.dist.integrity && !metadata.dist.shasum)) {
        throw new Error("npm registry returned incomplete distribution metadata");
      }

      log.log(`Verified ${packageName}@${version} on npm (attempt ${attempt}/${attempts}).`);
      return metadata;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      log.warn(
        `npm has not returned complete metadata for ${packageName}@${version} ` +
          `(attempt ${attempt}/${attempts}): ${formatError(error)}`
      );
      await sleep(delayMs);
    }
  }

  throw new Error(
    `npm did not return complete metadata for ${packageName}@${version} after ${attempts} attempts: ${formatError(lastError)}`,
    { cause: lastError }
  );
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const [packageName, version] = process.argv.slice(2);
  await verifyNpmPublication({
    packageName,
    registry: process.env.NPM_CONFIG_REGISTRY || process.env.npm_config_registry || DEFAULT_REGISTRY,
    version
  });
}
