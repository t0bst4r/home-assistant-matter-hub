import { FC, useMemo } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { appTheme } from "./theme.ts";
import {
  AppProvider,
  Branding,
  DashboardLayout,
  Navigation,
  Router,
} from "@toolpad/core";
import { routes } from "../routes.tsx";
import Box from "@mui/material/Box";

const navigation: Navigation = routes
  .filter((route) => !!route.title)
  .map((route) => ({
    segment: route.segment,
    title: route.title,
    icon: route.icon,
  }));

export const AppLayout: FC = () => {
  const navigate = useNavigate();

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
      title: "Home Assistant Matter Hub",
      logo: <></>,
    }),
    [],
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
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
};
