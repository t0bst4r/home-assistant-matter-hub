import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { Link, useParams } from "react-router-dom";
import { useBridge } from "../../hooks/data/bridges.ts";
import { memo, useCallback, useEffect, useState } from "react";
import { useNotifications } from "@toolpad/core";
import { useDevices } from "../../hooks/data/devices.ts";
import { DeviceList } from "../../components/device/DeviceList.tsx";
import { useTimer } from "../../hooks/timer.ts";
import { IconButton, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { Edit, Refresh } from "@mui/icons-material";

const MemoizedBridgeDetails = memo(BridgeDetails);
const MemoizedDeviceList = memo(DeviceList);

export const BridgeDetailsPage = () => {
  const [seed, setSeed] = useState<number>(0);
  const [timer, setTimer] = useState(0);

  const notifications = useNotifications();
  const { bridgeId } = useParams() as { bridgeId: string };

  const {
    content: bridge,
    isLoading: bridgeLoading,
    error: bridgeError,
  } = useBridge(bridgeId);
  const [devices, _, devicesError] = useDevices(bridgeId, seed);

  const { refreshNow } = useTimer({
    sleepSeconds: 9,
    startImmediate: true,
    callback: useCallback(() => setSeed(Date.now()), [setSeed]),
    onTick: useCallback(setTimer, []),
  });

  useEffect(() => {
    if (bridgeError) {
      notifications.show(bridgeError.message, { severity: "error" });
    }
  }, [bridgeError, notifications]);

  useEffect(() => {
    if (devicesError) {
      notifications.show(devicesError.message, { severity: "error" });
    }
  }, [devicesError, notifications]);

  if (!bridge && bridgeLoading) {
    return <>Loading</>;
  }

  if (!bridge) {
    return <>Not found</>;
  }

  return (
    <Stack spacing={4} mt={4}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">{bridge.name}</Typography>
        <IconButton component={Link} to="./edit">
          <Edit />
        </IconButton>
      </Box>

      <MemoizedBridgeDetails bridge={bridge} />

      <Stack spacing={2}>
        <Box display="flex" justifyContent="flex-start" alignItems="center">
          <Typography variant="h6">Devices</Typography>
          <IconButton onClick={refreshNow}>
            <Refresh />
          </IconButton>
          {timer != null && (
            <Typography variant="body2" color="textSecondary">
              Auto-refresh in {(timer / 1000).toFixed(0)} seconds...
            </Typography>
          )}
        </Box>

        {devices && (
          <MemoizedDeviceList devices={devices} onRefresh={refreshNow} />
        )}
      </Stack>
    </Stack>
  );
};
