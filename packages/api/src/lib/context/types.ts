import { type ResponseHeadersHandlerPluginContext } from "@orpc/server/plugins";

import { type AuthSession } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

export type OrpcContext = ResponseHeadersHandlerPluginContext & {
  session: AuthSession | null;
  logger: RequestLogger;
  requestHeaders: Headers;
};
