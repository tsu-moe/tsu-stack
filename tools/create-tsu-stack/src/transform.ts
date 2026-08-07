import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

import { pathExists, remove } from "fs-extra";

import { d1DatabaseName } from "./cloudflare";
import { SOURCE_REPOSITORY } from "./github";
import { type ProjectInput, type ResolvedTemplate } from "./types";
import { VARIANTS } from "./variants";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".dockerignore",
  ".env",
  ".example",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

const TEXT_FILENAMES = new Set([".dockerignore", ".gitignore", ".npmrc", "Dockerfile", "LICENSE"]);

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".output") {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function isTextFile(path: string): boolean {
  const name = path.split(/[\\/]/u).at(-1) ?? "";
  return TEXT_FILENAMES.has(name) || TEXT_EXTENSIONS.has(extname(name));
}

async function replaceInFile(path: string, replacer: (content: string) => string): Promise<void> {
  if (!(await pathExists(path))) return;
  const content = await readFile(path, "utf8");
  const next = replacer(content);
  if (next !== content) await writeFile(path, next, "utf8");
}

export function buildReproducibleCommand(input: ProjectInput, template: ResolvedTemplate): string {
  const args = [
    "vpx create-tsu-stack@latest",
    JSON.stringify(input.projectDirectory),
    "--display-name",
    JSON.stringify(input.displayName),
    "--scope",
    JSON.stringify(input.scope),
    "--variant",
    input.variant,
    input.install ? "--install" : "--no-install",
    input.git ? "--git" : "--no-git",
    "--setup",
    input.setup,
    "--ref",
    template.commit,
    "--yes"
  ];
  return args.join(" ");
}

export async function transformTemplate(
  root: string,
  input: ProjectInput,
  template: ResolvedTemplate,
  cliVersion: string
): Promise<void> {
  await remove(join(root, "tools", "create-tsu-stack"));
  await remove(join(root, ".agents", "cli.md"));
  await remove(join(root, "pnpm-lock.yaml"));

  const textFiles = (await listFiles(root)).filter(isTextFile);
  for (const path of textFiles) {
    await replaceInFile(path, (content) => content.replaceAll("@tsu-stack", input.scope));
  }

  const packagePath = join(root, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as Record<string, unknown>;
  packageJson.name = input.projectName;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

  for (const dockerPath of [
    "docker-compose.yaml",
    "docker-compose.coolify.yaml",
    "packages/db/docker-compose.dev.yaml"
  ]) {
    await replaceInFile(join(root, dockerPath), (content) =>
      content.replaceAll("tsu-stack", input.projectName)
    );
  }

  const variant = VARIANTS[input.variant];
  if (variant.transformHook.workerName) {
    await replaceInFile(join(root, "apps", "web", "wrangler.jsonc"), (content) =>
      content.replace(/("name"\s*:\s*)"[^"]*"/u, `$1${JSON.stringify(input.projectName)}`)
    );
  }
  if (variant.transformHook.d1Database) {
    await replaceInFile(join(root, "apps", "web", "wrangler.jsonc"), (content) =>
      content.replace(
        /("database_name"\s*:\s*)"[^"]*"/u,
        `$1${JSON.stringify(d1DatabaseName(input.projectName))}`
      )
    );
  }
  await replaceInFile(join(root, "packages", "env", ".env.example"), (content) =>
    content.replaceAll('/tsu-stack"', `/${input.projectName}"`)
  );
  await replaceInFile(join(root, "AGENTS.md"), (content) =>
    content.replace(/^# tsu-stack$/mu, `# ${input.displayName}`)
  );
  await replaceInFile(join(root, "apps", "web", "src", "config", "app.config.ts"), (content) =>
    content
      .replace(/longName: "[^"]*tsu!stack"/u, `longName: ${JSON.stringify(input.displayName)}`)
      .replace(/shortName: "tsu!stack"/u, `shortName: ${JSON.stringify(input.displayName)}`)
  );
  await replaceInFile(join(root, "packages", "i18n", "messages", "en.json"), (content) =>
    content.replaceAll("tsu-stack", input.displayName)
  );
  await replaceInFile(join(root, "packages", "i18n", "messages", "de.json"), (content) =>
    content.replaceAll("tsu-stack", input.displayName)
  );
  await replaceInFile(
    join(root, "packages", "i18n", "src", "tanstack-start", "lib", "validate-navigate-to.ts"),
    (content) => content.replaceAll("http://tsu-stack.local", `http://${input.projectName}.local`)
  );
  await replaceInFile(join(root, ".github", "README.md"), (content) =>
    content
      .replace(">tsu!stack</a>", `>${input.displayName}</a>`)
      .replace('alt="tsu!stack Logo"', `alt="${input.displayName} Logo"`)
  );

  if (variant.transformHook.mergedLocalServer) {
    await replaceInFile(join(root, "packages", "env", ".env.example"), (content) =>
      content.replace(
        'VITE_SERVER_URL="http://localhost:5000/server"',
        'VITE_SERVER_URL="http://localhost:3000/web/server"'
      )
    );
  }

  const remainingScopeReferences: string[] = [];
  for (const path of (await listFiles(root)).filter(isTextFile)) {
    if ((await readFile(path, "utf8")).includes("@tsu-stack")) {
      remainingScopeReferences.push(relative(root, path));
    }
  }
  if (remainingScopeReferences.length > 0) {
    throw new Error(
      `Template transformation left old workspace scope references in: ${remainingScopeReferences.join(", ")}`
    );
  }

  const reproducibleCommand = buildReproducibleCommand(input, template);
  const metadata = {
    $schema:
      "https://raw.githubusercontent.com/tsu-moe/tsu-stack/main/tools/create-tsu-stack/schema.json",
    cliVersion,
    displayName: input.displayName,
    projectName: input.projectName,
    reproducibleCommand,
    scope: input.scope,
    source: {
      branch: template.branch,
      commit: template.commit,
      repository: SOURCE_REPOSITORY,
      requestedRef: template.requestedRef
    },
    variant: input.variant
  };
  await writeFile(join(root, ".tsu-stack.jsonc"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}
