import AppLogo from "../assets/hamh-logo.svg?react";
import { FC, useMemo } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { appTheme } from "./theme.ts";
import {
  AppProvider,
  Branding,
  DashboardLayout,
  Navigation,
  Router,
} from "@toolpad/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAppInfo } from "../hooks/app-info.ts";
import { capitalize, useMediaQuery } from "@mui/material";
import { AppBreadcrumbs } from "./AppBreadcrumbs.tsx";
import { Coffee, Help, Polyline } from "@mui/icons-material";

const navigation: Navigation = [
  {
    segment: "bridges",
    title: "Bridges",
    icon: <Polyline />,
  },

  {
    segment: "funding",
    title: "Buy me a coffee",
    icon: <Coffee />,
  },
  {
    segment: "about",
    title: "About this project",
    icon: <Help />,
  },
];

export const AppLayout: FC = () => {
  const navigate = useNavigate();
  const appInfo = useAppInfo();
  const isLargeScreen = useMediaQuery("(min-width:600px)");

  const pathname = useLocation().pathname;
  const [searchParams] = useSearchParams();
  const router = useMemo<Router>(
    () => ({
      navigate: (url) => navigate(url),
      pathname,
      searchParams,
    }),
    [navigate, searchParams, pathname],
  );
  const branding = useMemo<Branding>(
    () => ({
      title: (
        <>
          <Box component="span">
            <AppLogo style={{ height: "1em" }} />
          </Box>
          <Typography variant="inherit" component="span" sx={{ mr: 1, ml: 1 }}>
            {appInfo.name.split("-").map(capitalize).join("-")}
          </Typography>
          {isLargeScreen && (
            <Typography variant="caption" component="span">
              {appInfo.version}
            </Typography>
          )}
        </>
      ) as unknown as string,
      logo: <></>,
    }),
    [appInfo, isLargeScreen],
  );

  return (
    <AppProvider
      theme={appTheme}
      router={router}
      branding={branding}
      navigation={navigation}
    >
      <DashboardLayout>
        <Box padding={2}>
          <AppBreadcrumbs />
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
};
