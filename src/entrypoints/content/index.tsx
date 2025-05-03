import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/tailwind/theme.css";
import "@/assets/tailwind/text-small.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { Provider as JotaiProvider } from "jotai/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./atoms";
import { mirrorDynamicStyle, addStyleToShadow } from "./utils/styles";
import { toast } from "sonner";
import { APP_NAME } from "@/utils/constants/app";
import { kebabCase } from "case-anything";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: kebabCase(APP_NAME),
      position: "overlay",
      anchor: "html",
      append: "last",
      onMount: (container, shadow) => {
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        const root = ReactDOM.createRoot(wrapper);

        addStyleToShadow(shadow);
        mirrorDynamicStyle("#_goober", shadow);

        const queryClient = new QueryClient({
          queryCache: new QueryCache({
            onError: (error, query) => {
              const errorDescription =
                query.meta?.errorDescription || "Something went wrong";
              toast.error(`${errorDescription}: ${error.message}`);
            },
          }),
          mutationCache: new MutationCache({
            onError: (error, _variables, _context, mutation) => {
              const errorDescription =
                mutation.meta?.errorDescription || "Something went wrong";
              toast.error(`${errorDescription}: ${error.message}`);
            },
          }),
        });
        const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
          useHydrateAtoms([[queryClientAtom, queryClient]]);
          return children;
        };

        root.render(
          <QueryClientProvider client={queryClient}>
            <JotaiProvider store={store}>
              <HydrateAtoms>
                <App />
              </HydrateAtoms>
            </JotaiProvider>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
            />
          </QueryClientProvider>
        );
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
