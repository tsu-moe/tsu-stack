import {
  QueryClient,
  QueryClientProvider as QueryClientProviderRaw,
  environmentManager
} from "@tanstack/react-query";
import { type ReactNode } from "react";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 2 minutes so that the client doesn't refetch when it hydrates from the SSR queryClient
        // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#initial-setup
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          if (
            error instanceof Error &&
            "status" in error &&
            [401, 403].includes((error as { status: number }).status)
          ) {
            return false;
          }
          return failureCount < 2;
        },
        staleTime: 1000 * 60 * 2
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined;

// On the server, create a new queryClient per-request to prevent credential leaking between SSR requests
// On the client, use the globally-available browserQueryClient to preserve cache
// See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#initial-setup
function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: always make a new query client for each request to prevent leaking data between requests
    return createQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

function QueryClientProvider({ children, client }: { children: ReactNode; client: QueryClient }) {
  return <QueryClientProviderRaw client={client}>{children}</QueryClientProviderRaw>;
}

export { getQueryClient, QueryClientProvider };
