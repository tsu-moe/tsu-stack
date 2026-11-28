import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { clearIdentity, setIdentity } from "@tsu-stack/logger/client";

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isError } = useQuery({ ...getAuthUserQueryOptions(), enabled: false });
  const userId = isError ? undefined : user?.id;

  useEffect(() => {
    if (userId) {
      setIdentity(userId);
    } else {
      clearIdentity();
    }

    return () => {
      clearIdentity();
    };
  }, [userId]);

  return children;
}
