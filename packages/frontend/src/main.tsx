import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Provider as StateProvider } from "react-redux";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import {
  faAmazon,
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { library as IconLibrary } from "@fortawesome/fontawesome-svg-core";

import { AppLayout } from "./theme/AppLayout.tsx";
import { routes } from "./routes.tsx";
import { store } from "./state/store.ts";

IconLibrary.add(faAmazon, faApple, faGoogle);

let basename = document
  .getElementsByTagName("base")[0]
  ?.href?.replace(/\/$/, "");
if (basename && basename.startsWith("http")) {
  basename = new URL(basename).pathname;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      children: routes,
    },
  ],
  {
    basename,
  },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StateProvider store={store}>
      <RouterProvider router={router} />
    </StateProvider>
  </StrictMode>,
);
