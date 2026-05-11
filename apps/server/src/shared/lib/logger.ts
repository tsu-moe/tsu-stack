import { ENV_SERVER } from "@tsu-stack/env/server/env";
import { LOG_SERVICES, initLogger } from "@tsu-stack/logger/server";

initLogger({
  env: {
    environment: ENV_SERVER.NODE_ENV,
    service: LOG_SERVICES.SERVER,
    version: ENV_SERVER.SOURCE_COMMIT
  }
});
