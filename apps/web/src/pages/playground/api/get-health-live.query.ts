import { useQuery } from "@tanstack/react-query";

import { orpc } from "@tsu-stack/api/client/tanstack-start/orpc";

export function useGetHealthLiveQuery(enabled: boolean) {
  return useQuery({ ...orpc.health.live.queryOptions(), enabled, retry: false });
}
