const TRAILING_SLASHES_REGEX = /\/+$/;
const LEADING_SLASHES_REGEX = /^\/+/;

export function resolvePublicAssetUrl(baseUrl: string, publicAssetPath: string): string {
  const normalizedBaseUrl = baseUrl.trim().replace(TRAILING_SLASHES_REGEX, "");
  const normalizedPublicAssetPath = publicAssetPath.trim().replace(LEADING_SLASHES_REGEX, "");

  if (!normalizedPublicAssetPath) {
    return normalizedBaseUrl || "/";
  }

  if (!normalizedBaseUrl) {
    return `/${normalizedPublicAssetPath}`;
  }

  return `${normalizedBaseUrl}/${normalizedPublicAssetPath}`;
}
