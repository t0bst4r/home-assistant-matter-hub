import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { capitalize } from "@mui/material/utils";
import { Link } from "react-router";
import SvgLogo from "../assets/hamh-logo.svg?react";
import { useAppInfo } from "../hooks/app-info.ts";
import { navigation } from "../routes.tsx";

export const AppLogo = (props: { large: boolean }) => {
  const appInfo = useAppInfo();

  return (
    <Box
      component={Link}
      to={navigation.bridges}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: props.large ? "flex-start" : "center",
        flexGrow: 1,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <SvgLogo style={{ height: "40px" }} />
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
