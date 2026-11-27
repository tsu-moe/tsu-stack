import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";
import { Button } from "@tsu-stack/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tsu-stack/ui/components/field";
import { Input } from "@tsu-stack/ui/components/input";
import { Separator, SeparatorContent } from "@tsu-stack/ui/components/separator";

import { useSignInForm } from "@/features/auth/hooks/use-sign-in-form.hook";

import { AuthPanel } from "./auth-panel";
import { SocialSignInButtons } from "./social-sign-in-buttons";

export function SignInForm({ redirectTo }: { redirectTo: NavigateTo }) {
  const { form, signInMutation } = useSignInForm(redirectTo);

  return (
    <AuthPanel title={m.auth__sign_in_title()}>
      <SocialSignInButtons />
      <Separator>
        <SeparatorContent className="text-xs text-muted-foreground">{m.auth__or()}</SeparatorContent>
      </Separator>
      <form
        aria-busy={signInMutation.isPending}
        className="-mt-2 flex flex-col gap-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!signInMutation.isPending && !signInMutation.isSuccess) void form.handleSubmit();
        }}
      >
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
                readOnly={signInMutation.isPending}
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
                autoComplete="current-password"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                readOnly={signInMutation.isPending}
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
        <Button type="submit" className="mt-4 w-full" disabled={signInMutation.isPending || signInMutation.isSuccess}>
          {signInMutation.isPending ? m.auth__signing_in() : m.auth__sign_in()}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {m.auth__sign_in_no_account()}{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            to="/create-an-account"
            search={{ redirect: redirectTo }}
          >
            {m.auth__sign_in_create_account()}
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
