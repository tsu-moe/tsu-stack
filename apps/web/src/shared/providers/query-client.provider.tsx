import {
  QueryClient,
  QueryClientProvider as QueryClientProviderRaw,
  environmentManager,
} from "@tanstack/react-query";
import { type PersistedClient, type Persister } from "@tanstack/react-query-persist-client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import localforage from "localforage";
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
        staleTime: 1000 * 60 * 2,
      },
    },
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

// Lazy-create persister only on client side to prevent server-side leaks
let persister: Persister | undefined;

function getPersister() {
  if (environmentManager.isServer()) {
    return undefined;
  }
  persister ??= createLocalForagePersister();
  return persister;
}

function QueryClientProvider({ children, client }: { children: ReactNode; client: QueryClient }) {
  const clientPersister = getPersister();

  // Only use persistence on the client, not on the server
  if (clientPersister) {
    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          persister: clientPersister,
          /**
           * We need to add this or else we will get `Uncaught (in promise) DataCloneError: Failed to execute 'put' on 'IDBObjectStore': #<Object> could not be cloned.`
           * when the query client tries to persist data that can't be structured cloned, such as a RSC payload object.
           * By default, react-query-persist-client will attempt to persist all queries,
           * but with this option we can filter out queries that contain unserializable data.
           */
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              try {
                structuredClone(query.state.data);
                return true;
              } catch {
                return false;
              }
            },
          },
        }}
      >
        <QueryClientProviderRaw client={client}>{children}</QueryClientProviderRaw>
      </PersistQueryClientProvider>
    );
  }

  // Server-side: no IndexedDB persistence, use only the raw provider
  return <QueryClientProviderRaw client={client}>{children}</QueryClientProviderRaw>;
}

/**
 * Creates a custom localForage persister to save the cache in IndexedDB
 * @see {@link https://github.com/localForage/localForage}
 * @see {@link https://tanstack.com/query/v4/docs/framework/react/plugins/persistQueryClient#building-a-persister}
 */
function createLocalForagePersister(idbValidKey = "cache") {
  const reactQueryLocalForage = localforage.createInstance({
    description: "Cached site data",
    name: "React Query",
    storeName: "cache",
    version: 1,
  });

  return {
    persistClient: async (client: PersistedClient) => {
      await reactQueryLocalForage.setItem(idbValidKey, client);
    },
    removeClient: async () => {
      await reactQueryLocalForage.removeItem(idbValidKey);
    },
    restoreClient: async () => await reactQueryLocalForage.getItem<PersistedClient>(idbValidKey),
  } as Persister;
}

export { getQueryClient, QueryClientProvider };
