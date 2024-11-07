import { useBridges, useDeleteBridge } from "../../hooks/data/bridges";
import { BridgeList } from "../../components/bridge/BridgeList";
import { Backdrop, CircularProgress, IconButton, Stack } from "@mui/material";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import { BridgeData } from "@home-assistant-matter-hub/common";
import { Add } from "@mui/icons-material";
import { useNotifications } from "@toolpad/core";
import { Link, useNavigate } from "react-router-dom";

export const BridgesPage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const deleteBridge = useDeleteBridge();
  const { content: bridges, isLoading, error: bridgeError } = useBridges();

  const setSelectedBridge = (bridge: BridgeData) => {
    navigate(`${bridge.id}`);
  };

  useEffect(() => {
    if (bridgeError) {
      notifications.show(bridgeError.message, { severity: "error" });
    }
  }, [bridgeError, notifications]);

  return (
    <>
      <Backdrop
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Stack spacing={4}>
        {bridges && (
          <Box>
            <Box display="flex" justifyContent="end">
              <IconButton component={Link} to="./create">
                <Add />
              </IconButton>
            </Box>

            <BridgeList
              bridges={bridges}
              onSelect={setSelectedBridge}
              onDelete={(b) => deleteBridge(b.id)}
            />
          </Box>
        )}
      </Stack>
    </>
  );
};
