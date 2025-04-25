import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  vite: () => ({
    plugins: [],
  }),
  manifest: {
    default_locale: "en",
    permissions: ["storage"],
  },
});
