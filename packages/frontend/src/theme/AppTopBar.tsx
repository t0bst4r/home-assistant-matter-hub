import { AppBar, Container, Toolbar, useMediaQuery } from "@mui/material";
import { AppLogo } from "./AppLogo.tsx";

export const AppTopBar = () => {
  const isLargeScreen = useMediaQuery("(min-width:600px)");

  return (
    <AppBar sx={{ height: "72px" }}>
      <Toolbar
        sx={{ paddingLeft: "0 !important", paddingRight: "0 !important" }}
      >
        <Container
          sx={{
            padding: 2,
            height: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <AppLogo large={isLargeScreen} />
        </Container>
      </Toolbar>
    </AppBar>
  );
};
