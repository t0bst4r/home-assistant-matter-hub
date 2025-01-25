import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { useParams } from "react-router";
import { useBridge } from "../../hooks/data/bridges.ts";
import { memo, useCallback, useEffect } from "react";
import { useDevices } from "../../hooks/data/devices.ts";
import { DeviceList } from "../../components/device/DeviceList.tsx";
import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { BridgeStatusIcon } from "../../components/bridge/BridgeStatusIcon.tsx";
import { BridgeStatusHint } from "../../components/bridge/BridgeStatusHint.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeMoreMenu } from "./BridgeMoreMenu.tsx";
import { navigation } from "../../routes.tsx";
import { useAppDispatch } from "../../state/hooks.ts";
import { loadDevices } from "../../state/devices/device-actions.ts";
import { useTimer } from "../../hooks/timer.ts";

const MemoizedBridgeDetails = memo(BridgeDetails);
const MemoizedDeviceList = memo(DeviceList);

export const BridgeDetailsPage = () => {
  const notifications = useNotifications();
  const dispatch = useAppDispatch();

  const { bridgeId } = useParams() as { bridgeId: string };

  const timerCallback = useCallback(() => {
    dispatch(loadDevices(bridgeId));
  }, [dispatch, bridgeId]);
  const timer = useTimer(10, timerCallback);

  const {
    content: bridge,
    isLoading: bridgeLoading,
    error: bridgeError,
  } = useBridge(bridgeId);
  const { content: devices, error: devicesError } = useDevices(bridgeId);

  useEffect(() => {
    if (bridgeError) {
      notifications.show({
        message: bridgeError.message ?? "Failed to load Bridge details",
        severity: "error",
      });
    }
  }, [bridgeError, notifications]);

  useEffect(() => {
    if (devicesError?.message) {
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
          { name: "Bridges", to: navigation.bridges },
          { name: bridge.name, to: navigation.bridge(bridgeId) },
        ]}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">
          {bridge.name} <BridgeStatusIcon status={bridge.status} />
        </Typography>
        <BridgeMoreMenu bridge={bridgeId} />
      </Box>

      <BridgeStatusHint status={bridge.status} reason={bridge.statusReason} />

      <MemoizedBridgeDetails bridge={bridge} />

      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Devices</Typography>
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            {timer != null && (
              <Typography variant="body2" color="textSecondary">
                Auto-refresh in {timer - 1} seconds...
              </Typography>
            )}
          </Box>
        </Box>

        {devices && <MemoizedDeviceList devices={devices} />}
      </Stack>
    </Stack>
  );
};
