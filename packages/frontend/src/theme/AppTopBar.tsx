import {
  AppBar,
  Button,
  capitalize,
  Container,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAppInfo } from "../hooks/app-info.ts";
import AppLogo from "../assets/hamh-logo.svg?react";
import BuyMeACoffeeLogo from "../assets/bmc-button.svg?react";
import Link from "@mui/material/Link";

const Logo = (props: { large: boolean }) => {
  const appInfo = useAppInfo();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={props.large ? "flex-start" : "center"}
      flexGrow={1}
    >
      <AppLogo style={{ height: "100%" }} />
      <Typography variant="inherit" component="span" sx={{ mr: 1, ml: 1 }}>
        {appInfo.name.split("-").map(capitalize).join("-")}
      </Typography>
      {props.large && (
        <Typography variant="caption" component="span">
          {appInfo.version}
        </Typography>
      )}
    </Box>
  );
};

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
          <Logo large={isLargeScreen} />
          <Funding large={isLargeScreen} />
        </Container>
      </Toolbar>
    </AppBar>
  );
};
