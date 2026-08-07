export const VARIANT_NAMES = ["separate", "merged", "cloudflare", "cloudflare-d1"] as const;
export type VariantName = (typeof VARIANT_NAMES)[number];

export const SETUP_MODES = ["none", "local", "cloudflare"] as const;
export type SetupMode = (typeof SETUP_MODES)[number];

export type CliFlags = {
  displayName?: string;
  dryRun?: boolean;
  git?: boolean;
  help?: boolean;
  install?: boolean;
  noGit?: boolean;
  noInstall?: boolean;
  projectDirectory?: string;
  ref?: string;
  scope?: string;
  setup?: string;
  variant?: string;
  version?: boolean;
  yes?: boolean;
};

export type ProjectInput = {
  displayName: string;
  dryRun: boolean;
  git: boolean;
  install: boolean;
  projectDirectory: string;
  projectName: string;
  ref?: string;
  scope: string;
  setup: SetupMode;
  variant: VariantName;
};

export type ResolvedTemplate = {
  branch: string;
  commit: string;
  requestedRef: string;
  variant: VariantName;
};

export type CommandRunner = {
  capture(command: string, args: string[], cwd: string): Promise<string>;
  run(command: string, args: string[], cwd: string): Promise<void>;
  succeeds(command: string, args: string[], cwd: string): Promise<boolean>;
};
