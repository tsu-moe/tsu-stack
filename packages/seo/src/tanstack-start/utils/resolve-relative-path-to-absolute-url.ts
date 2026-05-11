export function resolveRelativePathToAbsoluteUrl(
  path: string | URL,
  { baseUrl }: { baseUrl: string | URL }
): string {
  return new URL(path, baseUrl).toString();
}
