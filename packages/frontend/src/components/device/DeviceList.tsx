import { DeviceData } from "@home-assistant-matter-hub/common";
import {
  List,
  ListItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { PropsWithChildren, useMemo } from "react";
import { ClusterState } from "../cluster/ClusterState.tsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface DeviceListProps {
  readonly devices: DeviceData[];
}

export const DeviceList = ({ devices }: DeviceListProps) => {
  const sortedDevices = useMemo(
    () => [...devices].sort((a, b) => a.entityId.localeCompare(b.entityId)),
    [devices],
  );
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell size="small">Entity ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Endpoint</TableCell>
            <TableCell>State</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedDevices.map((device: DeviceData) => (
            <TableRow key={device.entityId}>
              <TableCell>{device.entityId}</TableCell>
              <TableCell>
                {
                  (
                    device.state.bridgedDeviceBasicInformation as
                      | { nodeLabel?: string }
                      | undefined
                  )?.nodeLabel
                }
              </TableCell>
              <TableCell>
                <GeneralInfo state={device.state}>
                  <Typography
                    variant="inherit"
                    component="span"
                    sx={{
                      textDecoration: (t) =>
                        `underline dashed ${t.palette.primary.main}`,
                    }}
                  >
                    {device.endpointType} (
                    {"0x" + device.endpointCode.padStart(4, "0")})
                  </Typography>
                </GeneralInfo>
              </TableCell>
              <TableCell>
                <DeviceState state={device.state} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface DeviceStateProps {
  state: Record<string, unknown>;
}

const DeviceState = ({ state }: DeviceStateProps) => {
  const keys = useMemo(() => Object.keys(state), [state]);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {keys.map((key) => (
        <ClusterState key={key} clusterId={key} state={state[key]} />
      ))}
    </Stack>
  );
};

const GeneralInfo = ({
  state,
  children,
}: PropsWithChildren<DeviceStateProps>) => {
  const keys = useMemo(() => Object.keys(state).sort(), [state]);
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="overline">Available Clusters:</Typography>
          <List dense={true}>
            {keys.map((key) => (
              <ListItem key={key}>{key}</ListItem>
            ))}
          </List>
        </Box>
      }
    >
      <span>{children}</span>
    </Tooltip>
  );
};
