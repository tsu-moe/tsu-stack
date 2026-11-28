export function resolveRelativePathToAbsoluteUrl(
  path: string | URL,
  { basePath, baseUrl }: { basePath?: string; baseUrl: string | URL }
): string {
  if (!basePath || typeof path !== "string" || path.startsWith("//")) return new URL(path, baseUrl).toString();

  const deploymentUrl = new URL("/", baseUrl);
  deploymentUrl.pathname = `${basePath.replace(/\/+$/, "")}/`;
  return new URL(path.startsWith("/") ? `.${path}` : path, deploymentUrl).toString();
}
