import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { AppLayout } from "./theme/AppLayout.tsx";
import { Route, routes } from "./routes.tsx";
import {
  faAmazon,
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { library as IconLibrary } from "@fortawesome/fontawesome-svg-core";

IconLibrary.add(faAmazon, faApple, faGoogle);

function mapRoute(
  route: Pick<Route, "segment" | "element" | "children">,
): RouteObject {
  return {
    path: route.segment,
    element: route.element,
    children: route.children?.map((r) => mapRoute(r)),
  };
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: routes.map((r) => mapRoute(r)),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
