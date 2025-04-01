import { BridgeStatus } from "@home-assistant-matter-hub/common";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface BridgeStatusIconProps {
  status: BridgeStatus;
  reason?: string;
}

export const BridgeStatusIcon = ({ status }: BridgeStatusIconProps) => {
  switch (status) {
    case BridgeStatus.Starting:
      return <RestartAltIcon fontSize="inherit" color="info" />;
    case BridgeStatus.Running:
      return <PlayCircleOutlineIcon fontSize="inherit" color="success" />;
    case BridgeStatus.Stopped:
      return <PauseCircleOutlineIcon fontSize="inherit" color="warning" />;
    case BridgeStatus.Failed:
      return <ErrorOutlineIcon fontSize="inherit" color="error" />;
  }
};
