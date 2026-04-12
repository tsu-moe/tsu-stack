import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { getAuthUserQueryOptions } from "#@/react/tanstack-start/queries";

export function useAuth() {
  const { data: user, isPending } = useQuery(getAuthUserQueryOptions());
  return { isPending, user };
}

export function useAuthSuspense() {
  const { data: user } = useSuspenseQuery(getAuthUserQueryOptions());
  return { user };
}
