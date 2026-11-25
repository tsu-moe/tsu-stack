import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { m } from "@tsu-stack/i18n/messages";

export function useSignInMutation(onSuccess: () => Promise<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const result = await authClient.signIn.email(values);

      if (!result.data) {
        throw new Error(result.error?.message ?? m.auth__sign_in_failed());
      }

      return result;
    },
    onError: (error: Error) => {
      toast.error(error.message || m.auth__sign_in_failed());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAuthUserQueryOptions());
      await onSuccess();
      toast.success(m.auth__sign_in_successful());
    }
  });
}
