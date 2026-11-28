import { z } from "zod";

import { m } from "@tsu-stack/i18n/messages";

const credentialFields = {
  email: z.email({ error: () => m.auth__invalid_email() }),
  password: z.string().min(8, { error: () => m.auth__password_min_length() })
};

export const SignInFormSchema = z.object(credentialFields);

export const CreateAnAccountFormSchema = z
  .object({
    confirmPassword: z.string(),
    email: credentialFields.email,
    name: z.string().min(2, { error: () => m.auth__name_min_length() }),
    password: credentialFields.password
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => m.auth__passwords_no_match(),
    path: ["confirmPassword"]
  });
