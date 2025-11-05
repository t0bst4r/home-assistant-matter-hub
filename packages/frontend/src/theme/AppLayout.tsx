import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import type { FC } from "react";
import { Outlet } from "react-router";
import { AppFooter } from "./AppFooter.tsx";
import { AppTopBar } from "./AppTopBar.tsx";

export const AppLayout: FC = () => {
  return (
    <Box>
      <AppTopBar />
      <Toolbar />
      <Container sx={{ p: 2 }}>
        <Outlet />
      </Container>
      <AppFooter />
    </Box>
  );
};
