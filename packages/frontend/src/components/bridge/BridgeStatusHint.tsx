import { BridgeStatus } from "@home-assistant-matter-hub/common";
import { Alert } from "@mui/material";
import { AlertColor } from "@mui/material/Alert/Alert";

export interface BridgeStatusHintProps {
  status: BridgeStatus;
  reason?: string;
}

const severity: Record<BridgeStatus, AlertColor> = {
  [BridgeStatus.Failed]: "error",
  [BridgeStatus.Stopped]: "warning",
  [BridgeStatus.Running]: "success",
};

export const BridgeStatusHint = ({ status, reason }: BridgeStatusHintProps) => {
  if (!reason) {
    return;
  }
  return (
    <Alert severity={severity[status]} variant="outlined">
      {reason}
    </Alert>
  );
};
