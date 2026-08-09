import { z } from "zod";

import { type ProjectInput, type ResolvedTemplate } from "./types";
import { VARIANTS } from "./variants";

const GITHUB_API = "https://api.github.com";
export const SOURCE_REPOSITORY = "tsu-moe/tsu-stack";

export async function resolveTemplate(input: ProjectInput): Promise<ResolvedTemplate> {
  const definition = VARIANTS[input.variant];
  const requestedRef = input.ref ?? definition.branch;
  const response = await fetch(
    `${GITHUB_API}/repos/${SOURCE_REPOSITORY}/commits/${encodeURIComponent(requestedRef)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
        "User-Agent": "create-tsu-stack",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }
  );

  if (!response.ok) {
    const rateLimitHint =
      response.status === 403 ? " Set GITHUB_TOKEN to raise GitHub API limits." : "";
    throw new Error(
      `Unable to resolve ${SOURCE_REPOSITORY}@${requestedRef} (${response.status} ${response.statusText}).${rateLimitHint}`
    );
  }

  const bodyResult = z
    .object({ sha: z.string().regex(/^[a-f0-9]{40}$/u) })
    .safeParse(await response.json());
  if (!bodyResult.success) {
    throw new Error(`GitHub returned an invalid commit for ${requestedRef}.`);
  }

  return {
    branch: definition.branch,
    commit: bodyResult.data.sha,
    requestedRef,
    variant: input.variant
  };
}

export function templateArchiveUrl(commit: string): string {
  return `https://codeload.github.com/${SOURCE_REPOSITORY}/tar.gz/${commit}`;
}
