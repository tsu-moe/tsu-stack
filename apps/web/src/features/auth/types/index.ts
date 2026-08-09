import { z } from "zod";

import { m } from "@tsu-stack/i18n/messages";

export const SignInFormSchema = z.object({
  email: z.email({ error: () => m.auth__invalid_email() }),
  password: z.string().min(8, { error: () => m.auth__password_min_length() })
});

export type SignInFormValues = z.infer<typeof SignInFormSchema>;

export const CreateAccountFormSchema = z
  .object({
    confirmPassword: z.string(),
    email: z.email({ error: () => m.auth__invalid_email() }),
    name: z.string().min(2, { error: () => m.auth__name_min_length() }),
    password: z.string().min(8, { error: () => m.auth__password_min_length() })
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => m.auth__passwords_no_match(),
    path: ["confirmPassword"]
  });

export type CreateAccountFormValues = z.infer<typeof CreateAccountFormSchema>;
export type CreateAccountCredentials = Pick<CreateAccountFormValues, "email" | "name" | "password">;
