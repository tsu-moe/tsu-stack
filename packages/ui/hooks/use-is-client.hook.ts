import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * Custom hook that determines if the code is running on the client side (in the browser).
 *
 * Returns `true` only on the client after hydration.
 * Uses `useSyncExternalStore` to avoid the `useEffect(setState, [])` flash.
 * @example
 * ```tsx
 * const isClient = useIsClient();
 * // Use isClient to conditionally render or execute code specific to the client side.
 * ```
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
