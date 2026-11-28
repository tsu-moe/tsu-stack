import { useForm } from "@tanstack/react-form";

import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";

import { useSignUpMutation } from "@/features/auth/api/sign-up.mutation";
import { CreateAnAccountFormSchema } from "@/features/auth/types/auth.types";

export function useCreateAnAccountForm(redirectTo: NavigateTo) {
  const navigate = useNavigate();
  const signUpMutation = useSignUpMutation(() => navigate({ to: redirectTo }));

  const form = useForm({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      const { email, name, password } = value;
      signUpMutation.mutate({ email, name, password });
    },
    validators: {
      onSubmit: CreateAnAccountFormSchema
    }
  });

  return { form, signUpMutation };
}
