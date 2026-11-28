import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { m } from "@tsu-stack/i18n/messages";
import { toast } from "@tsu-stack/ui/components/toast";

export function useSignInMutation(onSuccess: () => Promise<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const result = await authClient.signIn.email(values);

      if (!result.data) {
        throw new Error("Email sign-in failed");
      }

      return result;
    },
    onError: () => {
      toast.error({ title: m.auth__sign_in_failed() });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAuthUserQueryOptions());
      await onSuccess();
      toast.success({ title: m.auth__sign_in_successful() });
    }
  });
}
