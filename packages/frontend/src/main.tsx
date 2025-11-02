import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as StateProvider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { NotificationsProvider } from "./components/notifications/notifications-provider.tsx";
import { routes } from "./routes.tsx";
import { store } from "./state/store.ts";
import { AppLayout } from "./theme/AppLayout.tsx";
import { appTheme } from "./theme/theme.ts";

let basename = document
  .getElementsByTagName("base")[0]
  ?.href?.replace(/\/$/, "");
if (basename?.startsWith("http")) {
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
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            // @rsjf/mui has a bug which breaks nested item rendering (see https://github.com/rjsf-team/react-jsonschema-form/issues/4838)
            ".rjsf-field-array > .MuiFormControl-root > .MuiPaper-root > .MuiBox-root > .MuiGrid-root > .MuiGrid-root:has(> .MuiBox-root > .MuiPaper-root > .MuiBox-root > .rjsf-field)":
              {
                overflow: "initial !important",
                flexGrow: 1,
              },
          }}
        />
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </ThemeProvider>
    </StateProvider>
  </StrictMode>,
);
