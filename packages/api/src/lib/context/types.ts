import { type AuthSession } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

export type OrpcContext = {
  session: AuthSession | null;
  logger: RequestLogger;
};
