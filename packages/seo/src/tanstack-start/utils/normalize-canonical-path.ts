const LEADING_SLASH_REGEX = /^\/+/;
const NO_TRAILING_SLASH_REGEX = /\/+$/;

export function normalizeCanonicalPath(path: `/${string}`): `/${string}` {
  if (path === "/") {
    return path;
  }

  const normalizedPath = `/${path.replace(LEADING_SLASH_REGEX, "").replace(NO_TRAILING_SLASH_REGEX, "")}`;
  return normalizedPath as `/${string}`;
}
