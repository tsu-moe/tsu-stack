import { defineRelations } from "drizzle-orm";

import * as schema from "#@/schema/index";

export const relations = defineRelations(schema, (_r) => {
  return {
    // TODO: Define your relations here
    // https://orm.drizzle.team/docs/relations-v2
  };
});
