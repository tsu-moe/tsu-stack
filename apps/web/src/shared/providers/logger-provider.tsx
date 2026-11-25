import { useEffect } from "react";

import { useAuth } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { clearIdentity, setIdentity } from "@tsu-stack/logger/client";

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIdentity(user.id);
    } else {
      clearIdentity();
    }

    return () => {
      clearIdentity();
    };
  }, [user]);

  return children;
}
