import { Alert } from "@mui/material";
import { PropsWithChildren } from "react";

export interface BlockquoteProps extends PropsWithChildren {
  className?: string;
}

export const Blockquote = (props: BlockquoteProps) => {
  return (
    <Alert
      severity="info"
      icon={false}
      variant="outlined"
      sx={{ mt: 2, mb: 2 }}
      className={props.className}
      children={props.children}
    />
  );
};
