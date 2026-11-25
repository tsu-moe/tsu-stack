import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { REQUEST_ID_HEADER } from "@tsu-stack/logger/request-id";

const CLIENT_IP_HEADER = "x-tsu-client-ip";

export type ClientIpVariables = {
  clientIp: string;
};

export function clientIpMiddleware() {
  return createMiddleware<{ Variables: ClientIpVariables }>(async (c, next) => {
    c.set("clientIp", resolveClientIp(c.req.header("cf-connecting-ip")));
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
  const normalized = address?.trim();
  if (!normalized) return "unknown";

  return z.union([z.ipv4(), z.ipv6()]).safeParse(normalized).success ? normalized : "unknown";
}
