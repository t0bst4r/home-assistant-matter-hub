import type { AlertColor } from "@mui/material/Alert";

export interface NotificationOptions {
  message: string;
  autoHideDuration?: number;
  severity?: AlertColor;
}
