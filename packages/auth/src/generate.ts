import { createAuth } from "./index";

// Better Auth's CLI discovers an exported variable named `auth`. Keep this
// entrypoint CLI-only so Worker requests continue to use a fresh auth instance.
export const auth = createAuth();
