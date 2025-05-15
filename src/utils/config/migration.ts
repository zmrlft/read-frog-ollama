import deepmerge from "deepmerge";

import { Config } from "@/types/config/config";

import { CONFIG_SCHEMA_VERSION } from "../constants/config";

export const LATEST_SCHEMA_VERSION = CONFIG_SCHEMA_VERSION;

export const migrations: Record<number, (config: Config) => Config> = {
  2: (oldConfig) => {
    // add pageTranslate config
    return deepmerge(oldConfig, {
      pageTranslate: {
        range: "mainContent",
      },
    });
  },
};
