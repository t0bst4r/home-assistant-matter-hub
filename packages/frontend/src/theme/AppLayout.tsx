import { FC } from "react";
import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import { AppTopBar } from "./AppTopBar.tsx";
import { Container, Toolbar } from "@mui/material";
import { AppFooter } from "./AppFooter.tsx";

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
