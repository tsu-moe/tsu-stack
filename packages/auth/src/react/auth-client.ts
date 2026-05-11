import { createAuthClient } from "better-auth/react";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";

export const API_AUTH_URL = `${ENV_WEB_ISOMORPHIC.VITE_SERVER_URL}/auth`;

/**
 * IMPORTANT: Only use this for client-side operations (e.g. in React components or browser-only hooks).
 * It uses nanostores internally, which are not suitable for server-side usage due to lack of request isolation, leading to shared auth state.
 */
export const authClient = createAuthClient({
  baseURL: API_AUTH_URL
}) as ReturnType<typeof createAuthClient>;

export type AuthSession = typeof authClient.$Infer.Session;
