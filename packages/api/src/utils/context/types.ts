import { type AuthSession } from "@tsu-stack/auth/index";
import { type Logger } from "@tsu-stack/logger/types";

export type OrpcContext = {
  session: AuthSession | null;
  logger: Logger;
};
