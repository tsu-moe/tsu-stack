import { parseArgs } from "node:util";

import { type CliFlags } from "./types";

export function parseCliFlags(argv: string[]): CliFlags {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args: argv,
    options: {
      "display-name": { type: "string" },
      "dry-run": { type: "boolean" },
      git: { type: "boolean" },
      help: { short: "h", type: "boolean" },
      install: { type: "boolean" },
      "no-git": { type: "boolean" },
      "no-install": { type: "boolean" },
      ref: { type: "string" },
      scope: { type: "string" },
      setup: { type: "string" },
      variant: { type: "string" },
      version: { short: "v", type: "boolean" },
      yes: { short: "y", type: "boolean" }
    },
    strict: true
  });

  if (positionals.length > 1) throw new Error("Only one project directory may be provided.");
  if (values.install && values["no-install"]) {
    throw new Error("Use either --install or --no-install, not both.");
  }
  if (values.git && values["no-git"]) throw new Error("Use either --git or --no-git, not both.");

  return {
    displayName: values["display-name"],
    dryRun: values["dry-run"],
    git: values.git,
    help: values.help,
    install: values.install,
    noGit: values["no-git"],
    noInstall: values["no-install"],
    projectDirectory: positionals[0],
    ref: values.ref,
    scope: values.scope,
    setup: values.setup,
    variant: values.variant,
    version: values.version,
    yes: values.yes
  };
}

export const HELP_TEXT = `create-tsu-stack [project-directory]

Create a new tsu-stack project from a maintained repository variant.

Options:
  --display-name <name>                  Application display name
  --scope <scope>                        Internal workspace package scope
  --variant <separate|merged|cloudflare|cloudflare-d1>
                                          Template variant
  --install / --no-install               Install dependencies (default: install)
  --git / --no-git                       Initialize Git (default: git)
  --setup <none|local|cloudflare>        Optional database setup; cloud provisioning is D1-only
  --ref <branch|tag|sha>                 Override the selected variant's Git ref
  --dry-run                              Resolve and print the plan without writing
  -y, --yes                              Accept safe defaults for omitted options
  -v, --version                          Print the CLI version
  -h, --help                             Print this help

Examples:
  npm create tsu-stack@latest my-app
  vpx create-tsu-stack@latest my-app --variant cloudflare
  vpx create-tsu-stack@latest my-app --variant cloudflare-d1 --setup cloudflare
  create-tsu-stack my-app --yes --no-install --ref fafde6b
`;
