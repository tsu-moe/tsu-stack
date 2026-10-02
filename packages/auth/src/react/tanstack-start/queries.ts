import { environmentManager, queryOptions } from "@tanstack/react-query";

import { $getUser } from "#@/react/tanstack-start/functions";

export const authQueryKeys = {
  user: ["user"]
};

export function getAuthUserQueryOptions() {
  return queryOptions({
    staleTime: 1000 * 60 * 5, // 5 minute (matches /packages/auth/src/index.ts)
    // IMPORTANT: Server-side GC timers keep prerender builds alive until they expire.
    gcTime: environmentManager.isServer() ? Infinity : 1000 * 60 * 10,
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always", // To sync auth state across tabs if user signs in/out in another tab
    refetchOnMount: false,
    queryKey: authQueryKeys.user,
    queryFn: ({ signal }) => $getUser({ signal }),
    retry: 3, // Retry logic for transient failures under high load
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000)
  });
}

export type AuthQueryResult = Awaited<ReturnType<typeof $getUser>>;
