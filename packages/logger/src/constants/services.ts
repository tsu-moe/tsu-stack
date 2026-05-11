/**
 * Stable service names used in evlog events.
 *
 * Naming convention:
 * - `web__server`: TanStack Start / web SSR logs
 * - `web__client`: browser logs sent through the Hono ingest endpoint
 * - `server`: standalone Hono server logs
 * - `default`: fallback when a service is not explicitly selected
 *
 * Future feature-specific services should append segments, for example
 * `web__server__todo`.
 *
 * Import these from the relevant logger facade:
 * `@tsu-stack/logger/client` or `@tsu-stack/logger/server`.
 */
export const LOG_SERVICES = Object.freeze({
  DEFAULT: "default",
  SERVER: "server",
  WEB_CLIENT: "web__client",
  WEB_SERVER: "web__server"
});

export type LogService = (typeof LOG_SERVICES)[keyof typeof LOG_SERVICES];
