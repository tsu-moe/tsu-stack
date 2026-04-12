import { createContext, useContext, useMemo } from "react";

import { useAuth } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { LOGGER_CATEGORIES_CLIENT, getLogger } from "@tsu-stack/logger/client";

type LoggerContextValue = {
  logger: ReturnType<typeof getLogger>;
};

const LoggerContext = createContext<LoggerContextValue | null>(null);

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const baseLogger = getLogger(LOGGER_CATEGORIES_CLIENT.WEB_CLIENT);
  const logger = useMemo(() => {
    if (user) {
      return baseLogger.with({ user });
    }
    return baseLogger.with({ user: { id: "anonymous" } });
  }, [user, baseLogger]);

  return <LoggerContext.Provider value={{ logger }}>{children}</LoggerContext.Provider>;
}

function useLogger(): ReturnType<typeof getLogger> {
  const context = useContext(LoggerContext);
  if (!context) {
    const logger = getLogger(LOGGER_CATEGORIES_CLIENT.WEB);
    logger.warn("[{fn}] Called outside of LoggerProvider", { fn: "useLogger" });
    return logger;
  }
  return context.logger;
}
