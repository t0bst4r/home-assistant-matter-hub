import { Button, Container, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  BridgeConfigEditor,
  EditableBridgeConfig,
} from "../../components/bridge/BridgeConfigEditor.tsx";
import {
  useBridge,
  useCreateBridge,
  useUpdateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useNotifications } from "@toolpad/core";

const defaultConfig: EditableBridgeConfig = {
  filter: {
    include: [],
    exclude: [],
  },
};

const ResponsiveLabel = ({ children }: PropsWithChildren) => (
  <Grid
    size={{ xs: 12, sm: 4, md: 3 }}
    sx={{ display: { xs: "none", sm: "block" } }}
  >
    {children}
  </Grid>
);

const ResponsiveFormField = ({ children }: PropsWithChildren) => (
  <Grid size={{ xs: 12, sm: 8, md: 9 }}>{children}</Grid>
);

export const EditBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { bridgeId } = useParams() as { bridgeId?: string };
  const { content: bridge } = useBridge(bridgeId);
  const usedPorts = useUsedPorts();

  const createBridge = useCreateBridge();
  const updateBridge = useUpdateBridge();

  const [name, setName] = useState("");
  const [nameIsValid, setNameIsValid] = useState(false);

  const [port, setPort] = useState<number>();
  const [portIsValid, setPortIsValid] = useState(false);

  const [currentConfig, setCurrentConfig] =
    useState<EditableBridgeConfig>(defaultConfig);
  const [configIsValid, setConfigIsValid] = useState(true);

  const isValid = nameIsValid && portIsValid && configIsValid;

  const configChanged = (
    config: EditableBridgeConfig | undefined,
    isValid: boolean,
  ) => {
    if (config) {
      setCurrentConfig(config);
    }
    setConfigIsValid(isValid);
  };

  const saveAction = () => {
    if (!isValid) {
      notifications.show("Your configuration doesn't seem to be valid.", {
        severity: "error",
      });
      return;
    }

    if (bridge) {
      updateBridge({ ...currentConfig!, name, port: port!, id: bridge.id })
        .then(() => navigate(`/bridges/${bridge.id}`))
        .catch((err: Error) =>
          notifications.show(err.message, { severity: "error" }),
        );
    } else {
      createBridge({ ...currentConfig!, name, port: port! })
        .then(() => navigate("/bridges"))
        .catch((err: Error) =>
          notifications.show(err.message, { severity: "error" }),
        );
    }
  };

  useEffect(() => {
    if (bridge) {
      setPort(bridge.port);
      setName(bridge.name);
      setCurrentConfig({ filter: bridge.filter });
    }
  }, [bridge]);

  useEffect(() => {
    if (usedPorts != undefined) {
      setPort(nextFreePort(usedPorts));
    }
  }, [usedPorts]);

  useEffect(() => {
    setNameIsValid(name.length > 0);
  }, [name]);

  useEffect(() => {
    if (usedPorts != undefined) {
      setPortIsValid(port != undefined && usedPorts[port] == undefined);
    }
  }, [usedPorts, port]);

  return (
    <Container>
      <Grid container spacing={2}>
        <ResponsiveLabel>Name</ResponsiveLabel>
        <ResponsiveFormField>
          <TextField
            error={!nameIsValid}
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ResponsiveFormField>
        <ResponsiveLabel>Port</ResponsiveLabel>
        <ResponsiveFormField>
          <TextField
            error={!portIsValid}
            fullWidth
            type="number"
            label="Port"
            value={port ?? ""}
            onChange={(e) => setPort(Number(e.target.value))}
          />
        </ResponsiveFormField>

        <Grid size={12}>
          <BridgeConfigEditor config={currentConfig} onChange={configChanged} />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            component={Link}
            to={bridge ? `/bridges/${bridge.id}` : "/bridges"}
          >
            Cancel
          </Button>
        </Grid>
        <Grid
          size={{ xs: 0, sm: 4, md: 6 }}
          sx={{ display: { xs: "none", sm: "block" } }}
        />
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            disabled={!isValid}
            onClick={saveAction}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

function nextFreePort(usedPorts: Record<number, string>) {
  let port = 5540;
  while (usedPorts[port]) {
    port++;
  }
  return port;
}
