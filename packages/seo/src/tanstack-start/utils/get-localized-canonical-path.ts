import { normalizeCanonicalPath } from "#@/tanstack-start/utils/normalize-canonical-path";

export function getLocalizedCanonicalPath({
  baseLocale,
  canonicalPath,
  locale
}: {
  baseLocale?: string;
  canonicalPath: `/${string}`;
  locale?: string;
}): `/${string}` {
  const normalizedPath = normalizeCanonicalPath(canonicalPath);

  if (!locale || locale === baseLocale) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}
