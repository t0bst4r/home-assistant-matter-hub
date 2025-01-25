import { useBridges } from "../../hooks/data/bridges";
import { BridgeList } from "../../components/bridge/BridgeList";
import { Backdrop, Button, CircularProgress, Stack } from "@mui/material";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import { Add } from "@mui/icons-material";
import { Link } from "react-router";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { navigation } from "../../routes.tsx";

export const BridgesPage = () => {
  const notifications = useNotifications();

  const { content: bridges, isLoading, error: bridgeError } = useBridges();

  useEffect(() => {
    if (bridgeError) {
      notifications.show({
        message: bridgeError.message ?? "Could not load bridges",
        severity: "error",
      });
    }
  }, [bridgeError, notifications]);

  return (
    <>
      <Backdrop
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        {isLoading && <CircularProgress color="inherit" />}
      </Backdrop>

      <Stack spacing={4}>
        {bridges && (
          <>
            <Box
              display="flex"
              justifyContent="end"
              paddingTop={{ xs: 1, sm: 0 }}
            >
              <Button
                component={Link}
                to={navigation.createBridge}
                endIcon={<Add />}
                variant="outlined"
              >
                Create new bridge
              </Button>
            </Box>

            <BridgeList bridges={bridges} />
          </>
        )}
      </Stack>
    </>
  );
};
