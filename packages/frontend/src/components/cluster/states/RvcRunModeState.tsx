import type { RvcRunModeClusterState } from "@home-assistant-matter-hub/common";
import { useMemo } from "react";

export interface RvcRunModeStateProps {
  state: RvcRunModeClusterState;
}

export const RvcRunModeState = (props: RvcRunModeStateProps) => {
  const { currentMode, supportedModes } = props.state;
  const currentModeItem = useMemo(
    () => supportedModes.find((mode) => mode.mode === currentMode),
    [currentMode, supportedModes],
  );
  return <>{currentModeItem?.label ?? `Current Mode: ${currentMode}`}</>;
};
