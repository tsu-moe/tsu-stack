import { BlockList, isIP } from "node:net";

import { getConnInfo } from "@hono/node-server/conninfo";
import { createMiddleware } from "hono/factory";

const CLIENT_IP_HEADER = "x-tsu-client-ip";

export type ClientIpVariables = {
  clientIp: string;
};

export function clientIpMiddleware(trustedProxies: string[]) {
  const isTrustedProxy = createTrustedProxyCheck(trustedProxies);

  return createMiddleware<{ Variables: ClientIpVariables }>(async (c, next) => {
    let remoteAddress: string | undefined;
    try {
      remoteAddress = getConnInfo(c).remote.address;
    } catch {
      // Hono's in-memory request helper does not expose a network connection.
    }

    c.set("clientIp", resolveClientIp(c.req.header("x-forwarded-for"), remoteAddress, isTrustedProxy));
    await next();
  });
}

export function withClientIp(request: Request, clientIp: string) {
  const headers = new Headers(request.headers);
  headers.set(CLIENT_IP_HEADER, clientIp);
  return new Request(request, { headers });
}

export function resolveClientIp(
  forwardedFor: string | undefined,
  remoteAddress: string | undefined,
  isTrustedProxy: (address: string) => boolean
) {
  const remoteIp = normalizeIp(remoteAddress);
  if (!remoteIp) return "unknown";

  const chain = [
    ...(forwardedFor
      ?.split(",")
      .map(normalizeIp)
      .filter((address): address is string => Boolean(address)) ?? []),
    remoteIp
  ];

  for (let index = chain.length - 1; index >= 0; index--) {
    const address = chain[index];
    if (address && !isTrustedProxy(address)) return address;
  }

  return chain[0] ?? remoteIp;
}

function createTrustedProxyCheck(entries: string[]) {
  const blockList = new BlockList();

  for (const entry of entries) {
    const [address, prefix] = entry.split("/");
    const normalizedAddress = normalizeIp(address);
    if (!normalizedAddress) continue;

    const family = isIP(normalizedAddress) === 4 ? "ipv4" : "ipv6";
    if (prefix === undefined) {
      blockList.addAddress(normalizedAddress, family);
    } else {
      blockList.addSubnet(normalizedAddress, Number(prefix), family);
    }
  }

  return (address: string) => {
    const normalizedAddress = normalizeIp(address);
    if (!normalizedAddress) return false;
    return blockList.check(normalizedAddress, isIP(normalizedAddress) === 4 ? "ipv4" : "ipv6");
  };
}

function normalizeIp(address: string | undefined) {
  const normalized = address?.trim().replace(/^"|"$/g, "");
  if (!normalized) return undefined;

  const ipv4 = normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
  return isIP(ipv4) ? ipv4 : undefined;
}
