import { useQuery } from "@tanstack/react-query";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";

export function useNavbarUserQuery() {
  // Public pages check the session on mount and recover on focus or reconnect.
  return useQuery({ ...getAuthUserQueryOptions(), refetchOnMount: "always", retry: false });
}
