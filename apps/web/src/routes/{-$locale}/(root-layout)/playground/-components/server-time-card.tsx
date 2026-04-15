import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

import { m } from "@tsu-stack/i18n/messages";

function ServerTimeCard() {
  const timeNow = new Date().toLocaleTimeString();

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-medium">{m.playground_page__server_time()}</h3>
      <p>{timeNow}</p>
    </div>
  );
}

const $getServerTimeCard = createServerFn().handler(async () =>
  renderServerComponent(<ServerTimeCard />),
);

/**
 * IMPORTANT: We need to disable structural sharing for this query since the data is a React component which contains non-serializable values, and react-query's default behavior is to do structural sharing which can cause the component to not update properly on refetch.
 * @see {@link https://tanstack.com/start/latest/docs/framework/react/guide/server-components#tanstack-query}
 */
export const getServerTimeCardQueryOptions = () =>
  queryOptions({
    queryKey: ["ServerTimeCard"],
    queryFn: async () => await $getServerTimeCard(),
    structuralSharing: false,
  });
