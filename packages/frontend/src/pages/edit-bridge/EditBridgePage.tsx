import { Container } from "@mui/material";
import { useMemo } from "react";
import {
  useBridge,
  useUpdateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { useNavigate, useParams } from "react-router";
import { useNotifications } from "@toolpad/core";
import { BridgeConfig } from "@home-assistant-matter-hub/common";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";

export const EditBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { bridgeId } = useParams() as { bridgeId: string };
  const { content: bridge, isLoading } = useBridge(bridgeId);
  const usedPorts = useUsedPorts();
  const updateBridge = useUpdateBridge();

  const bridgeConfig = useMemo<BridgeConfig | undefined>(() => {
    if (isLoading || !bridge) {
      return undefined;
    } else {
      return {
        name: bridge.name,
        port: bridge.port,
        filter: bridge.filter,
        featureFlags: bridge.featureFlags,
      };
    }
  }, [isLoading, bridge]);

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await updateBridge({ ...config, id: bridgeId })
      .then(() =>
        notifications.show("Update completed", { severity: "success" }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show(err.message, { severity: "error" }),
      );
  };

  if (isLoading || !usedPorts) {
    return <>Loading</>;
  } else if (!bridge || !bridgeConfig) {
    return <>Not found</>;
  }

  return (
    <Container>
      <BridgeConfigEditor
        bridgeId={bridgeId}
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Container>
  );
};
