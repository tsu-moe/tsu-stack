import { cn } from "@tsu-stack/ui/lib/utils";

import { type TerminalLine } from "@/pages/home/config/setup-steps.config";

const SPINNER_FRAMES = ["|", "/", "-", "\\"] as const;
const SPINNER_FRAME_MS = 100;

export function SetupTerminalOutput({
  lines,
  progress,
  actionDurationMs
}: {
  lines: readonly TerminalLine[];
  progress: number;
  actionDurationMs: number;
}) {
  return (
    <div
      aria-live="off"
      className="flex flex-col gap-2 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in"
    >
      {lines.map((line) => {
        const fullText = typeof line.text === "string" ? line.text : line.text();
        const cue = progress >= line.from ? line : line.before?.find(({ from }) => progress >= from);
        const text = typeof cue?.text === "function" ? cue.text() : (cue?.text ?? "");
        const typeUntil = cue?.typeUntil;
        const typing = cue !== undefined && typeUntil !== undefined && progress < typeUntil;
        const shownText = typing
          ? text.slice(0, Math.floor((text.length * (progress - cue.from)) / (typeUntil - cue.from)))
          : text;
        const showFullText = cue !== undefined && !typing && text === fullText;
        const prompt = cue?.prompt;
        const promptChanged = prompt !== line.prompt;
        const spinner =
          cue?.prompt === "spinner"
            ? SPINNER_FRAMES[
                Math.floor(((progress - cue.from) * actionDurationMs) / SPINNER_FRAME_MS) % SPINNER_FRAMES.length
              ]
            : undefined;

        return (
          <div key={fullText} data-slot="setup-terminal-line" className="flex items-baseline gap-2 font-mono text-sm">
            <span aria-hidden="true" className="w-3 shrink-0 text-muted-foreground">
              <span className={cn(promptChanged && "motion-safe:hidden")}>{line.prompt}</span>
              {promptChanged && (
                <span data-slot={spinner ? "setup-terminal-spinner" : undefined} className="motion-reduce:hidden">
                  {spinner ?? prompt}
                </span>
              )}
            </span>
            <pre className="relative min-w-0 wrap-anywhere whitespace-pre-wrap">
              <code>
                <span className={cn(!showFullText && "motion-safe:opacity-0")}>{fullText}</span>
                {!showFullText && cue && (
                  <span aria-hidden="true" className="absolute inset-0 motion-reduce:hidden">
                    {shownText}
                  </span>
                )}
              </code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}
