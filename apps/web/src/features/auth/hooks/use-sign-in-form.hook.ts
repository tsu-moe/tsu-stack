import { useForm } from "@tanstack/react-form";

import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";

import { useSignInMutation } from "@/features/auth/api/sign-in.mutation";
import { SignInFormSchema } from "@/features/auth/types/auth.types";

export function useSignInForm(redirectTo: NavigateTo) {
  const navigate = useNavigate();
  const signInMutation = useSignInMutation(() => navigate({ to: redirectTo }));

  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      signInMutation.mutate(value);
    },
    validators: {
      onSubmit: SignInFormSchema
    }
  });

  return { form, signInMutation };
}
