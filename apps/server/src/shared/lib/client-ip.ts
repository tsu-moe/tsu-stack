import { isIP } from "node:net";

import { createMiddleware } from "hono/factory";

import { REQUEST_ID_HEADER } from "@tsu-stack/logger/request-id";

const CLIENT_IP_HEADER = "x-tsu-client-ip";

export type ClientIpVariables = {
  clientIp: string;
};

export function clientIpMiddleware(trustedIpHeader: string | undefined) {
  return createMiddleware<{ Variables: ClientIpVariables }>(async (c, next) => {
    c.set("clientIp", resolveClientIp(trustedIpHeader ? c.req.header(trustedIpHeader) : undefined));
    await next();
  });
}

export function withAuthRequestContext(request: Request, clientIp: string, requestId: string) {
  const headers = withClientIpHeaders(request.headers, clientIp);
  headers.set(REQUEST_ID_HEADER, requestId);
  return new Request(request, { headers });
}

export function withClientIpHeaders(headers: HeadersInit, clientIp: string) {
  const verifiedHeaders = new Headers(headers);
  verifiedHeaders.set(CLIENT_IP_HEADER, clientIp);
  return verifiedHeaders;
}

export function resolveClientIp(address: string | undefined) {
  return normalizeIp(address) ?? "unknown";
}

function normalizeIp(address: string | undefined) {
  const normalized = address?.trim().replace(/^"|"$/g, "");
  if (!normalized) return undefined;

  const ipv4 = normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
  return isIP(ipv4) ? ipv4 : undefined;
}
