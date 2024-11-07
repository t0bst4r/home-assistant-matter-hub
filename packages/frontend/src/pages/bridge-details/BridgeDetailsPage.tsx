import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { Link, useParams } from "react-router-dom";
import { useBridge } from "../../hooks/data/bridges.ts";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "@toolpad/core";
import { useDevices } from "../../hooks/data/devices.ts";
import { DeviceList } from "../../components/device/DeviceList.tsx";
import { useTimer } from "../../hooks/timer.ts";
import { IconButton, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { Edit } from "@mui/icons-material";

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
    onTick: setTimer,
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

      <BridgeDetails bridge={bridge} />

      {devices && (
        <DeviceList devices={devices} timer={timer} onRefresh={refreshNow} />
      )}
    </Stack>
  );
};
