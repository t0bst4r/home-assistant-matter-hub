import { MediaInputClusterState } from "@home-assistant-matter-hub/common";
import InputIcon from "@mui/icons-material/Input";
import { useMemo } from "react";

export interface MediaInputStateProps {
  state: MediaInputClusterState;
}

export const MediaInputState = ({ state }: MediaInputStateProps) => {
  const input = useMemo(
    () => state.inputList?.find((input) => input.index === state.currentInput),
    [state],
  );
  return (
    <>
      <InputIcon fontSize="medium" />
      <span>{input?.name ?? "Unknown"}</span>
    </>
  );
};
