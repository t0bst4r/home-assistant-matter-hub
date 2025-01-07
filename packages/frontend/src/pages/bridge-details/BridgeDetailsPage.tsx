import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { Link as RouterLink, useParams } from "react-router";
import { useBridge } from "../../hooks/data/bridges.ts";
import { memo, useCallback, useEffect, useState } from "react";
import { useDevices } from "../../hooks/data/devices.ts";
import { DeviceList } from "../../components/device/DeviceList.tsx";
import { useTimer } from "../../hooks/timer.ts";
import { IconButton, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { Edit, Refresh } from "@mui/icons-material";
import { BridgeStatusIcon } from "../../components/bridge/BridgeStatusIcon.tsx";
import { BridgeStatusHint } from "../../components/bridge/BridgeStatusHint.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";

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
    onTick: setTimer,
  });

  useEffect(() => {
    if (bridgeError) {
      notifications.show({
        message: bridgeError.message ?? "Failed to load Bridge details",
        severity: "error",
      });
    }
  }, [bridgeError, notifications]);

  useEffect(() => {
    if (devicesError) {
      notifications.show({ message: devicesError.message, severity: "error" });
    }
  }, [devicesError, notifications]);

  if (!bridge && bridgeLoading) {
    return <>Loading</>;
  }

  if (!bridge) {
    return <>Not found</>;
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs
        items={[
          { name: "Bridges", to: "/" },
          { name: bridge.name, to: `/bridges/${bridgeId}` },
        ]}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">
          {bridge.name} <BridgeStatusIcon status={bridge.status} />
        </Typography>
        <IconButton component={RouterLink} to="./edit">
          <Edit />
        </IconButton>
      </Box>

      <BridgeStatusHint status={bridge.status} reason={bridge.statusReason} />

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

        {devices && <MemoizedDeviceList devices={devices} />}
      </Stack>
    </Stack>
  );
};
