import { PropsWithChildren, useMemo } from "react";
import { Alert } from "@mui/material";
import { Blockquote } from "./Blockquote.tsx";
import { AlertColor } from "@mui/material/Alert/Alert";

export type GithubAlertSeverity =
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution";

export interface GithubAlertProps extends PropsWithChildren {
  severity?: GithubAlertSeverity | string;
  className?: string;
}

export const GithubAlert = (props: GithubAlertProps) => {
  const severity = useMemo<AlertColor | undefined>(() => {
    switch (props.severity) {
      case "note":
        return "info";
      case "tip":
        return "success";
      case "important":
        return "warning";
      case "warning":
        return "warning";
      case "caution":
        return "error";
      default:
        return undefined;
    }
  }, [props]);

  if (severity) {
    return (
      <Alert
        severity={severity}
        variant="outlined"
        sx={{
          mt: 2,
          mb: 2,
          ".markdown-alert-title": {
            display: "none",
          },
        }}
        children={props.children}
        className={props.className}
      />
    );
  } else {
    return <Blockquote children={props.children} className={props.className} />;
  }
};
