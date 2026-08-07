import { writeFile } from "node:fs/promises";
import { isAbsolute, posix } from "node:path";

import { x as extractTar } from "tar";

import { templateArchiveUrl } from "./github";

const LINK_ENTRY_TYPES = new Set(["SymbolicLink", "Link"]);

export function archiveRootFromEntry(entryPath: string): string | undefined {
  const normalized = entryPath.replaceAll("\\", "/").replace(/^\.\//u, "");
  const root = normalized.split("/")[0];
  return root && root !== "." && root !== ".." ? root : undefined;
}

export function validateArchiveEntry(entryPath: string, entryType?: string): boolean {
  const normalized = entryPath.replaceAll("\\", "/");
  if (isAbsolute(normalized) || normalized.startsWith("/") || /^[A-Za-z]:\//u.test(normalized)) {
    return false;
  }
  if (normalized.includes("\0")) return false;
  if (LINK_ENTRY_TYPES.has(entryType ?? "")) return false;

  const segments = normalized.split("/");
  return (
    segments.every((segment) => segment !== ".." && segment !== ".") &&
    !posix.normalize(normalized).startsWith("../")
  );
}

export async function downloadAndExtractTemplate(
  commit: string,
  archivePath: string,
  destination: string
): Promise<void> {
  const response = await fetch(templateArchiveUrl(commit), {
    headers: { "User-Agent": "create-tsu-stack" },
    redirect: "follow"
  });
  if (!response.ok) {
    throw new Error(
      `Unable to download template archive (${response.status} ${response.statusText}).`
    );
  }

  await writeFile(archivePath, Buffer.from(await response.arrayBuffer()));
  let archiveRoot: string | undefined;
  await extractTar({
    cwd: destination,
    file: archivePath,
    filter: (entryPath, entry) => {
      const entryType = "type" in entry ? entry.type : undefined;
      if (!validateArchiveEntry(entryPath, entryType)) {
        throw new Error(`Unsafe template archive entry: ${entryPath}`);
      }
      const entryRoot = archiveRootFromEntry(entryPath);
      if (!entryRoot) throw new Error(`Template archive entry has no root: ${entryPath}`);
      archiveRoot ??= entryRoot;
      if (entryRoot !== archiveRoot) {
        throw new Error(`Template archive contains multiple roots: ${archiveRoot}, ${entryRoot}`);
      }
      return true;
    },
    strip: 1
  });
}
