import { describe, expect, it } from "vitest";

import type { Config } from "@/types/config/config";

import { LATEST_SCHEMA_VERSION, migrations } from "../migration";
import { ConfigV1Example } from "./example-config";

describe("Config Migration", () => {
  describe("Schema Version", () => {
    it("should have a valid schema version", () => {
      expect(LATEST_SCHEMA_VERSION).toBeDefined();
      expect(typeof LATEST_SCHEMA_VERSION).toBe("number");
    });
  });

  describe("Schema Migration Functions", () => {
    describe("1 -> 2", () => {
      it("should have migration function for version 2", () => {
        expect(migrations[2]).toBeDefined();
        expect(typeof migrations[2]).toBe("function");
      });

      it("should add pageTranslate config in version 2 migration", () => {
        // Create a config without pageTranslate

        // Cast to Config to simulate an old config before pageTranslate was required
        const oldConfig = ConfigV1Example as Config;

        const newConfig = migrations[2](oldConfig);

        expect(newConfig.pageTranslate).toBeDefined();
        expect(newConfig.pageTranslate.range).toBe("mainContent");
      });

      it("should preserve existing config properties during migration", () => {
        // Clone DEFAULT_CONFIG to avoid modifying the original
        const oldConfig = ConfigV1Example as Config;

        const newConfig = migrations[2](oldConfig);

        // Verify original properties are preserved
        expect(newConfig.language.targetCode).toBe("jpn");
        expect(newConfig.providersConfig.openai.apiKey).toBe("sk-1234567890");
        expect(newConfig.providersConfig.deepseek.apiKey).toBeUndefined();
      });
    });
  });
});
