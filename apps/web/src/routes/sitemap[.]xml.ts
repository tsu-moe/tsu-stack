import { createFileRoute } from "@tanstack/react-router";

import { getRouteTreePathsLocalized } from "@tsu-stack/i18n/tanstack-start/lib/get-route-tree-paths-localized";

import { appConfig } from "@/config/app.config";
import { routeTree } from "@/routeTree.gen";

/**
 * If you're using subpaths, on your root domain, you need to make a sitemap index to link the subpath sitemaps.
 * See: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#sitemap-index
 */
export const Route = createFileRoute("/sitemap.xml")({
  preload: false,
  server: {
    handlers: {
      GET: () => {
        const allRoutes = getRouteTreePathsLocalized(routeTree);
        const { baseUrl } = appConfig.site;
        const { basePath } = appConfig.site;
        const lastmod = new Date().toISOString().split("T")[0];

        // Filter routes that should be included in sitemap
        const routes = allRoutes.filter(shouldIncludeInSitemap);

        // Remove duplicates (keep unique URLs only)
        const uniqueUrls = new Map<string, (typeof routes)[0]>();
        for (const route of routes) {
          const url = normalizeUrl(baseUrl, basePath, route.path);
          if (!uniqueUrls.has(url)) {
            uniqueUrls.set(url, route);
          }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(
  uniqueUrls.keys(),
  (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
).join("\n")}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});

const AMPERSAND_REGEX = /&/g;
const LESS_THAN_REGEX = /</g;
const GREATER_THAN_REGEX = />/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const SINGLE_QUOTE_REGEX = /'/g;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(AMPERSAND_REGEX, "&amp;")
    .replace(LESS_THAN_REGEX, "&lt;")
    .replace(GREATER_THAN_REGEX, "&gt;")
    .replace(DOUBLE_QUOTE_REGEX, "&quot;")
    .replace(SINGLE_QUOTE_REGEX, "&apos;");
}

const BASE_PATH_REGEX = /\/+$/;
const PATH_REGEX = /^\/+/;
const DOUBLE_SLASH_REGEX = /([^:]\/)\/+/g;

function normalizeUrl(baseUrl: string, basePath: string, path: string): string {
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(BASE_PATH_REGEX, "");
  // Ensure basePath starts with a slash and remove trailing slashes
  const cleanBasePath = basePath
    ? `/${basePath.replace(BASE_PATH_REGEX, "").replace(PATH_REGEX, "")}`
    : "";
  // Ensure path starts with a single slash and remove trailing slashes
  const cleanPath = `/${path.replace(PATH_REGEX, "").replace(BASE_PATH_REGEX, "")}`;
  // Combine and remove any double slashes
  const url = `${cleanBaseUrl}${cleanBasePath}${cleanPath}`.replace(DOUBLE_SLASH_REGEX, "$1");
  // Ensure the final URL includes the basePath and remove trailing slash
  return url.replace(BASE_PATH_REGEX, "");
}

function shouldIncludeInSitemap(route: { id: string; path: string }): boolean {
  const path = route.path.toLowerCase();

  // Exclude API routes
  if (path.includes("/_api/") || path.endsWith("/_api")) {
    return false;
  }

  // Exclude file routes (sitemap, robots, etc)
  if (path.includes(".")) {
    return false;
  }

  // Exclude routes with dynamic segments that aren't in {-$locale}
  if (path.includes("$") || path.includes(":")) {
    return false;
  }

  // Exclude routes with special characters that might indicate internals
  if (path.includes("_")) {
    return false;
  }

  return true;
}
