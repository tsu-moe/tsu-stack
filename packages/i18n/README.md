# @tsu-stack/i18n

## Usage

### TanStack Start

We have to create a `src/server.ts` file with the following content:

```ts
import { paraglideMiddleware } from "@tsu-stack/i18n/server";
import handler from "@tanstack/react-start/server-entry";

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req));
  }
};
```

This will ensure that the i18n middleware is properly integrated into the server-side rendering process of TanStack Start.
