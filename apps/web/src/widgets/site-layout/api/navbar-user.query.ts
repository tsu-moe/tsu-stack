import { useQuery } from "@tanstack/react-query";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";

export function useNavbarUserQuery() {
  // The prerendered public page can hydrate with a cached guest session.
  return useQuery({ ...getAuthUserQueryOptions(), refetchOnMount: "always" });
}
