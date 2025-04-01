import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import clipboard from "clipboardy";
import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useState,
} from "react";

export interface CopyToClipboardProps extends PropsWithChildren {
  text: ReactNode;
  getValue: () => string;
}

export const CopyToClipboard = (props: CopyToClipboardProps) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  useEffect(() => {
    if (showCopySuccess) {
      setTimeout(() => setShowCopySuccess(false), 3000);
    }
  }, [showCopySuccess]);

  const copyState = async () => {
    await clipboard.write(props.getValue());
    setShowCopySuccess(true);
  };

  return (
    <Tooltip title={!showCopySuccess ? props.text : <>Copied</>} arrow>
      <Box
        sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={copyState}
      >
        {props.children}
      </Box>
    </Tooltip>
  );
};
