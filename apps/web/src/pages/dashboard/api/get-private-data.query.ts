import { useQuery } from "@tanstack/react-query";

import { orpc } from "@tsu-stack/api/client/tanstack-start/orpc";

export function useGetPrivateDataQuery(userId: string | undefined) {
  return useQuery({
    ...orpc.private.data.queryOptions({
      // Scope the cache to the signed-in user. The server still derives identity from the session.
      queryKey: [...orpc.private.data.key({ type: "query" }), userId]
    }),
    enabled: userId !== undefined
  });
}
