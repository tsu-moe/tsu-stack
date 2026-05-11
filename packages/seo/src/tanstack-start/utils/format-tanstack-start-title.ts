import { type TanStackStartSeoSite } from "#@/tanstack-start/types";

export function formatTanStackStartTitle({
  site,
  title
}: {
  site: TanStackStartSeoSite;
  title: string;
}): string {
  if (!site.titleTemplate) {
    return title;
  }

  return site.titleTemplate.includes("%s")
    ? site.titleTemplate.replace("%s", title)
    : `${title} ${site.titleTemplate}`;
}
