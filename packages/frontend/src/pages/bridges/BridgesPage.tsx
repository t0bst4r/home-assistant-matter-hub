import {
  useBridges,
  useDeleteBridge,
  useResetBridge,
} from "../../hooks/data/bridges";
import { BridgeList } from "../../components/bridge/BridgeList";
import { Backdrop, Button, CircularProgress, Stack } from "@mui/material";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import { Add } from "@mui/icons-material";
import { Link, useNavigate } from "react-router";
import { useNotifications } from "../../components/notifications/use-notifications.ts";

export const BridgesPage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const deleteBridge = useDeleteBridge();
  const resetBridge = useResetBridge();

  const { content: bridges, isLoading, error: bridgeError } = useBridges();

  const setSelectedBridge = (bridge: BridgeDataWithMetadata) => {
    navigate(`./bridges/${bridge.id}`);
  };

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
                to="./bridges/create"
                endIcon={<Add />}
                variant="outlined"
              >
                Create new bridge
              </Button>
            </Box>

            <BridgeList
              bridges={bridges}
              onSelect={setSelectedBridge}
              onDelete={(b) => deleteBridge(b.id)}
              onReset={(b) => resetBridge(b.id)}
            />
          </>
        )}
      </Stack>
    </>
  );
};
