import { basename, resolve } from "node:path";

import validatePackageName from "validate-npm-package-name";

const INVALID_SLUG_CHARACTERS = /[^a-z0-9._-]+/g;
const REPEATED_DASHES = /-+/g;
const TRIM_DASHES = /^-+|-+$/g;

export function normalizeProjectName(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(INVALID_SLUG_CHARACTERS, "-")
    .replaceAll(REPEATED_DASHES, "-")
    .replaceAll(TRIM_DASHES, "");

  if (!normalized) throw new Error("Project name must contain a letter or number.");

  const validation = validatePackageName(normalized);
  if (!validation.validForNewPackages) {
    const problems = [...(validation.errors ?? []), ...(validation.warnings ?? [])];
    throw new Error(`Invalid project name: ${problems.join("; ")}`);
  }

  return normalized;
}

export function defaultDisplayName(slug: string): string {
  return slug
    .split(/[-_.]+/u)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function normalizeScope(value: string): string {
  const withoutAt = value.trim().replace(/^@/u, "");
  const slug = normalizeProjectName(withoutAt);
  return `@${slug}`;
}

export function projectNameFromDirectory(directory: string): string {
  const absolute = resolve(directory);
  return normalizeProjectName(basename(absolute));
}
