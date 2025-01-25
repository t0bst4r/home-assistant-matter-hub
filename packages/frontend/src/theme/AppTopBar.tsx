import {
  AppBar,
  Button,
  Container,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import BuyMeACoffeeLogo from "../assets/bmc-button.svg?react";
import Link from "@mui/material/Link";
import { AppLogo } from "./AppLogo.tsx";

const Funding = (props: { large: boolean }) => {
  if (!props.large) {
    return (
      <IconButton
        component={Link}
        href="https://buymeacoffee.com/t0bst4r"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ backgroundColor: "#ffdd00", color: "#0D0C22" }}
      >
        <BuyMeACoffeeLogo style={{ width: "24px" }} />
      </IconButton>
    );
  }
  return (
    <Button
      component={Link}
      href="https://buymeacoffee.com/t0bst4r"
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<BuyMeACoffeeLogo style={{ width: "24px" }} />}
      sx={{ backgroundColor: "#ffdd00", color: "#0D0C22" }}
    >
      Buy me a coffee
    </Button>
  );
};

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
          <Funding large={isLargeScreen} />
        </Container>
      </Toolbar>
    </AppBar>
  );
};
