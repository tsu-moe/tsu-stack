import { resolvePublicAssetUrl } from "@tsu-stack/core/assets";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";

export const apiDocsUrl = resolvePublicAssetUrl(ENV_WEB_ISOMORPHIC.VITE_SERVER_URL, "/docs");
export const repositoryUrl = "https://github.com/tsu-moe/tsu-stack";
export const scaffoldingUrl = `${repositoryUrl}/blob/main/tools/create-tsu-stack/README.md`;
