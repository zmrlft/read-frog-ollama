import { camel, mapKeys } from "radash";
import { z } from "zod";

export const camelCaseSchemaDef = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .record(z.any())
    .transform((x) => mapKeys(x, camel))
    .pipe(schema) as T;