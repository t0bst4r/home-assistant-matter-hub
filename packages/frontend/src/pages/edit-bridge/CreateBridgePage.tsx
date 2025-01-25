import { useMemo } from "react";
import { useCreateBridge, useUsedPorts } from "../../hooks/data/bridges.ts";
import { useNavigate } from "react-router";
import { BridgeConfig } from "@home-assistant-matter-hub/common";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { Stack } from "@mui/material";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";

const defaultConfig: Omit<BridgeConfig, "port"> = {
  name: "",
  featureFlags: {
    matterSpeakers: false,
  },
  filter: {
    include: [],
    exclude: [],
  },
};

function nextFreePort(usedPorts: Record<number, string>) {
  let port = 5540;
  while (usedPorts[port]) {
    port++;
  }
  return port;
}

export const CreateBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const usedPorts = useUsedPorts();
  const bridgeConfig: BridgeConfig | undefined = useMemo(() => {
    if (usedPorts) {
      return { ...defaultConfig, port: nextFreePort(usedPorts) };
    } else {
      return undefined;
    }
  }, [usedPorts]);

  const createBridge = useCreateBridge();

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await createBridge({ ...config })
      .then(() =>
        notifications.show({ message: "Bridge saved", severity: "success" }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (!bridgeConfig || !usedPorts) {
    return <>Loading</>;
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs
        items={[
          { name: "Bridges", to: "/" },
          { name: "Create New", to: "/bridges/create" },
        ]}
      />

      <BridgeConfigEditor
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Stack>
  );
};
