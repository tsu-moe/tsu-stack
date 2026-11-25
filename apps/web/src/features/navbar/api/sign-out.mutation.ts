import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";

export function useSignOutMutation(onResponse?: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      authClient.signOut({
        fetchOptions: {
          onResponse: async () => {
            await queryClient.invalidateQueries(getAuthUserQueryOptions());
            await router.invalidate();
            onResponse?.();
          }
        }
      })
  });
}
