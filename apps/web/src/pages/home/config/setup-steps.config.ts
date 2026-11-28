import { m } from "@tsu-stack/i18n/messages";

type TerminalCue = {
  text: string | (() => string);
  from: number;
  typeUntil?: number;
  prompt?: "$" | ">" | "✓" | "spinner";
};

export type TerminalLine = TerminalCue & {
  before?: readonly TerminalCue[];
};

const deploymentStack = {
  id: "cloudflare-d1",
  label: () => "Workers + D1",
  technology: "D1",
  platform: "Cloudflare Workers"
};

const stackOptions = [
  { id: "separate", label: m.home_page__setup_stack_split },
  { id: "merged", label: m.home_page__setup_stack_merged },
  { id: "cloudflare", label: () => "Workers + PostgreSQL" },
  deploymentStack
];

// The terminal reads earlier cues from latest to earliest.
const stackCursorCues = [
  { id: "cloudflare", from: 0.82 },
  { id: "merged", from: 0.69 },
  { id: "separate", from: 0.56 },
  { id: "merged", from: 0.43 },
  { id: "cloudflare", from: 0.3 },
  { id: "merged", from: 0.17 },
  { id: "separate", from: 0.04 }
];

const deploymentStatus = () =>
  m.home_page__setup_deploy_detected({
    technology: deploymentStack.technology,
    platform: deploymentStack.platform
  });

const stackDetectionCues = stackOptions.reduceRight<TerminalCue[]>((cues, { id }, index) => {
  cues.push({
    text: () => m.home_page__setup_deploy_detecting({ variant: id }),
    from: 0.21 + index * 0.09,
    prompt: "spinner"
  });
  return cues;
}, []);

export const setupSteps: readonly {
  id: string;
  title: () => string;
  description: () => string;
  lines: readonly TerminalLine[];
}[] = [
  {
    id: "cli",
    title: m.home_page__setup_cli,
    description: m.home_page__setup_cli_description,
    lines: [
      { text: "vpx create-tsu-stack@next", from: 0.04, typeUntil: 0.4, prompt: "$" },
      { text: m.home_page__setup_cli_directory_prompt, from: 0.5 },
      { text: "my-app", from: 0.62, typeUntil: 0.87, prompt: ">" }
    ]
  },
  {
    id: "stack",
    title: m.home_page__setup_stack,
    description: m.home_page__setup_stack_description,
    lines: stackOptions.map(({ id, label }) => {
      const text = () => id.padEnd(16) + label();
      return {
        text,
        from: 0.95,
        prompt: id === deploymentStack.id ? ">" : undefined,
        before: stackCursorCues.map(({ id: selectedId, from }) => {
          return { text, from, prompt: id === selectedId ? ">" : undefined };
        })
      };
    })
  },
  {
    id: "deploy",
    title: m.home_page__setup_deploy,
    description: m.home_page__setup_deploy_description,
    lines: [
      { text: "vp run deploy", from: 0.02, typeUntil: 0.19, prompt: "$" },
      {
        text: deploymentStatus,
        from: 0.97,
        before: [{ text: deploymentStatus, from: 0.57, prompt: "spinner" }, ...stackDetectionCues]
      },
      {
        text: () => m.home_page__setup_deploy_output({ platform: deploymentStack.platform }),
        from: 0.97,
        prompt: "✓"
      }
    ]
  }
];
