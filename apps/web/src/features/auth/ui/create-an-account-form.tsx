import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { useAuth } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";
import { Button } from "@tsu-stack/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@tsu-stack/ui/components/field";
import { Input } from "@tsu-stack/ui/components/input";
import { Spinner } from "@tsu-stack/ui/components/spinner";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Container } from "@/shared/ui/container";
import { LogoIcon } from "@/shared/ui/logo";

import { appConfig } from "@/config/app.config";

export function CreateAnAccountForm({
  redirectTo = "/",
  className,
  ...props
}: React.ComponentProps<"div"> & { redirectTo?: NavigateTo }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPending } = useAuth();

  const signUpMutation = useMutation({
    mutationFn: async (values: { email: string; name: string; password: string }) => {
      const result = await authClient.signUp.email({
        email: values.email,
        name: values.name,
        password: values.password,
      });

      if (!result.data) {
        throw new Error(result.error?.message ?? m.auth__sign_up_failed());
      }

      return result;
    },
    onError: (error: Error) => {
      toast.error(error.message || m.auth__sign_up_failed());
    },
    onSuccess: async () => {
      // Invalidate auth cache to force refetch with new user data
      await queryClient.invalidateQueries(getAuthUserQueryOptions());
      await navigate({
        to: redirectTo,
      });
      toast.success(m.auth__sign_up_successful());
    },
  });

  const form = useForm({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const { email, name, password } = value;
      signUpMutation.mutate({ email, name, password });
    },
    validators: {
      onSubmit: z
        .object({
          confirmPassword: z.string(),
          email: z.email(m.auth__invalid_email()),
          name: z.string().min(2, m.auth__name_min_length()),
          password: z.string().min(8, m.auth__password_min_length()),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: m.auth__passwords_no_match(),
          path: ["confirmPassword"],
        }),
    },
  });

  if (isPending) {
    return <Spinner />;
  }

  return (
    <Container className={cn("flex max-w-md flex-col gap-6", className)} {...props}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <LogoIcon className="flex size-8 items-center justify-center rounded-md" />
              <span className="sr-only">{appConfig.site.shortName}</span>
            </Link>
            <h1 className="text-xl font-bold">{m.auth__create_account_title()}</h1>
            <FieldDescription>
              {m.auth__already_have_account()}{" "}
              <Link to="/sign-in" search={{ redirect: redirectTo }}>
                {m.auth__sign_in_link()}
              </Link>
            </FieldDescription>
          </div>

          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{m.auth__name_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                  placeholder={m.auth__name_placeholder()}
                />
                {field.state.meta.errors.map((error) => (
                  <p className="text-sm text-destructive" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{m.auth__email_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  value={field.state.value}
                  placeholder={m.auth__email_placeholder()}
                />
                {field.state.meta.errors.map((error) => (
                  <p className="text-sm text-destructive" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{m.auth__password_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p className="text-sm text-destructive" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{m.auth__confirm_password_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p className="text-sm text-destructive" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>

          <Field>
            <Button
              light="skeuomorphic"
              type="submit"
              disabled={signUpMutation.isPending || signUpMutation.isSuccess}
            >
              {signUpMutation.isPending ? m.auth__creating_account() : m.auth__create_account()}
            </Button>
          </Field>

          <FieldSeparator>{m.auth__or()}</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              onClick={() => toast.error(m.auth__not_yet_implemented())}
              variant="outline"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              {m.auth__continue_with_apple()}
            </Button>
            <Button
              onClick={() => toast.error(m.auth__not_yet_implemented())}
              variant="outline"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {m.auth__continue_with_google()}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        {m.auth__terms_agreement()} <Link to="/terms-of-service">{m.auth__terms_of_service()}</Link>{" "}
        {m.auth__and()} <Link to="/privacy-policy">{m.auth__privacy_policy()}</Link>.
      </FieldDescription>
    </Container>
  );
}
