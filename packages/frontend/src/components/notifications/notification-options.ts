import { AlertColor } from "@mui/material/Alert/Alert";

export interface NotificationOptions {
  message: string;
  autoHideDuration?: number;
  severity?: AlertColor;
}
