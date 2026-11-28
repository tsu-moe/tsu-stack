import { type TanStackStartSeoImage, type TanStackStartSeoMetaTag } from "#@/tanstack-start/types";
import { isDefined } from "#@/tanstack-start/utils/is-defined";

export function buildOpenGraphImageMeta(images?: TanStackStartSeoImage[]): TanStackStartSeoMetaTag[] {
  if (!images?.length) {
    return [];
  }

  return images.flatMap((image) => {
    const { alt, height, type, url, width } = image;
    return [
      {
        content: url,
        property: "og:image"
      },
      alt
        ? {
            content: alt,
            property: "og:image:alt"
          }
        : undefined,
      width
        ? {
            content: `${width}`,
            property: "og:image:width"
          }
        : undefined,
      height
        ? {
            content: `${height}`,
            property: "og:image:height"
          }
        : undefined,
      type
        ? {
            content: type,
            property: "og:image:type"
          }
        : undefined
    ].filter(isDefined);
  });
}
