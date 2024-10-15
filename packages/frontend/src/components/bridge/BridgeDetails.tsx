import { BridgeData } from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import QRCode from "react-qr-code";
import Grid from "@mui/material/Grid2";
import { useDevices } from "../../hooks/data/devices.ts";
import { DeviceList } from "../device/DeviceList.tsx";
import { useNotifications } from "@toolpad/core";
import { useCallback, useEffect, useState } from "react";
import { FabricList } from "../fabric/FabricList.tsx";
import { useTimer } from "../../hooks/timer.ts";

export interface BridgeDetailsProps {
  readonly bridge: BridgeData;
}

export const BridgeDetails = ({ bridge }: BridgeDetailsProps) => {
  const notifications = useNotifications();

  const [seed, setSeed] = useState<number>(0);
  const [timer, setTimer] = useState(0);
  const [devices, _, error] = useDevices(bridge, seed);
  const { refreshNow, reset: resetTimer } = useTimer(
    10,
    useCallback(() => setSeed(Date.now()), [setSeed]),
    setTimer,
  );

  useEffect(() => {
    if (error) {
      notifications.show(error.message, { severity: "error" });
    }
  }, [notifications, error]);

  useEffect(() => {
    resetTimer();
  }, [bridge, resetTimer]);

  return (
    <Stack spacing={4}>
      <Box pl={1} pb={1}>
        <Typography variant="h4">{bridge.name}</Typography>
        <Typography variant="caption">{bridge.id}</Typography>
      </Box>

      <Paper sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Pairing bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <BasicInfo bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <CommissioningInfo bridge={bridge} />
          </Grid>
        </Grid>
      </Paper>

      {devices && (
        <DeviceList devices={devices} timer={timer} onRefresh={refreshNow} />
      )}
    </Stack>
  );
};

const Pairing = (props: { bridge: BridgeData }) => {
  if (!props.bridge.commissioning) {
    return <></>;
  }
  return (
    <Box display="flex" justifyContent="center">
      <Box position="relative" maxWidth="160px">
        {props.bridge.commissioning.isCommissioned && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{ transform: "translate(-50%, -50%) rotate(-45deg)" }}
          >
            <Alert color="success" variant="filled">
              Commissioned
            </Alert>
          </Box>
        )}
        <QRCode
          value={props.bridge.commissioning.qrPairingCode}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    </Box>
  );
};

const BasicInfo = (props: { bridge: BridgeData }) => {
  return (
    <>
      <Typography variant="subtitle2" component="div">
        <div>ID: {props.bridge.id}</div>
        <div>Name: {props.bridge.name}</div>
        <div>Port: {props.bridge.port}</div>
        <div>
          <div>Fabrics:</div>
          <div style={{ fontSize: "1.5em" }}>
            {props.bridge.commissioning?.fabrics && (
              <FabricList fabrics={props.bridge.commissioning.fabrics} />
            )}
          </div>
        </div>
      </Typography>
    </>
  );
};

const CommissioningInfo = (props: { bridge: BridgeData }) => {
  if (!props.bridge.commissioning) {
    return <></>;
  }
  return (
    <Typography variant="subtitle2" component="div">
      <div>Passcode: {props.bridge.commissioning.passcode}</div>
      <div>Discriminator: {props.bridge.commissioning.discriminator}</div>
      <div>
        Manual Pairing Code: {props.bridge.commissioning.manualPairingCode}
      </div>
      <div>QR Pairing Code: {props.bridge.commissioning.qrPairingCode}</div>
    </Typography>
  );
};
