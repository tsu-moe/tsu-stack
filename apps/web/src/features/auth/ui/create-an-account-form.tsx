import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";
import { Button } from "@tsu-stack/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tsu-stack/ui/components/field";
import { Input } from "@tsu-stack/ui/components/input";

import { useSignUpMutation } from "@/features/auth/api/sign-up.mutation";
import { AuthPanel } from "@/features/auth/ui/auth-panel";

export function CreateAnAccountForm({ redirectTo }: { redirectTo: NavigateTo }) {
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
      onSubmit: z
        .object({
          confirmPassword: z.string(),
          email: z.email({ error: () => m.auth__invalid_email() }),
          name: z.string().min(2, { error: () => m.auth__name_min_length() }),
          password: z.string().min(8, { error: () => m.auth__password_min_length() })
        })
        .refine((data) => data.password === data.confirmPassword, {
          error: () => m.auth__passwords_no_match(),
          path: ["confirmPassword"]
        })
    }
  });
  return (
    <AuthPanel title={m.auth__create_account_title()}>
      <form
        aria-busy={signUpMutation.isPending}
        className="flex flex-col gap-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!signUpMutation.isPending && !signUpMutation.isSuccess) void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <Field name={field.name} invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>{m.auth__name_label()}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                readOnly={signUpMutation.isPending}
                value={field.state.value}
                placeholder={m.auth__name_placeholder()}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError match={true} key={error?.message}>
                  {error?.message}
                </FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <Field name={field.name} invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>{m.auth__email_label()}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="email"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                readOnly={signUpMutation.isPending}
                type="email"
                value={field.state.value}
                placeholder={m.auth__email_placeholder()}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError match={true} key={error?.message}>
                  {error?.message}
                </FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field name={field.name} invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>{m.auth__password_label()}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="new-password"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                readOnly={signUpMutation.isPending}
                type="password"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError match={true} key={error?.message}>
                  {error?.message}
                </FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <Field name={field.name} invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>{m.auth__confirm_password_label()}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="new-password"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                readOnly={signUpMutation.isPending}
                type="password"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError match={true} key={error?.message}>
                  {error?.message}
                </FieldError>
              ))}
            </Field>
          )}
        </form.Field>
        <Button type="submit" className="mt-4 w-full" disabled={signUpMutation.isPending || signUpMutation.isSuccess}>
          {signUpMutation.isPending ? m.auth__creating_account() : m.auth__create_account()}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {m.auth__already_have_account()}{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            to="/sign-in"
            search={{ redirect: redirectTo }}
          >
            {m.auth__sign_in_link()}
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
