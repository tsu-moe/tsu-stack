export type TanStackStartSeoMetaTag =
  | { title: string }
  | { charSet: string }
  | { content: string; httpEquiv: string }
  | { content: string; name: string }
  | { content: string; property: string };

export type TanStackStartSeoLinkTag = {
  as?: string;
  crossOrigin?: "" | "anonymous" | "use-credentials";
  href: string;
  hrefLang?: string;
  rel: string;
  type?: string;
};

export type TanStackStartSeoScriptTag = {
  children: string;
  type: "application/ld+json";
};

export type TanStackStartSeoHead = {
  links?: TanStackStartSeoLinkTag[];
  meta?: TanStackStartSeoMetaTag[];
  scripts?: TanStackStartSeoScriptTag[];
};

export type TanStackStartSeoImage = {
  alt?: string;
  height?: number;
  type?:
    | "image/apng"
    | "image/avif"
    | "image/gif"
    | "image/jpeg"
    | "image/png"
    | "image/svg+xml"
    | "image/webp";
  url: string;
  width?: number;
};

export type TanStackStartSeoRobots = {
  follow?: boolean;
  index?: boolean;
  maxImagePreview?: "large" | "none" | "standard";
  noarchive?: boolean;
  noimageindex?: boolean;
  nosnippet?: boolean;
};

export type TanStackStartSeoSite = {
  applicationName?: string;
  baseUrl: string;
  defaultDescription?: string;
  defaultImages?: TanStackStartSeoImage[];
  defaultTitle: string;
  defaultTwitterCard?: "app" | "player" | "summary" | "summary_large_image";
  siteName?: string;
  titleTemplate?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

export type TanStackStartSeoAlternates = {
  baseLocale?: string;
  canonicalPath: `/${string}`;
  locale?: string;
  locales?: readonly string[];
};

export type GenerateTanStackStartSeoParams = {
  alternates?: TanStackStartSeoAlternates;
  description?: string;
  images?: TanStackStartSeoImage[];
  includeDocumentMeta?: boolean;
  openGraphType?: "article" | "profile" | "website";
  robots?: TanStackStartSeoRobots;
  scripts?: TanStackStartSeoScriptTag[];
  site: TanStackStartSeoSite;
  title?: string;
};
