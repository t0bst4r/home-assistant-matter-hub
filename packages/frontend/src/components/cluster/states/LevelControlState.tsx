import { LevelControlClusterState } from "@home-assistant-matter-hub/common";
import { useMemo } from "react";

export interface LevelControlStateProps {
  state: LevelControlClusterState;
}

export const LevelControlState = ({ state }: LevelControlStateProps) => {
  const percentage = useMemo(() => {
    if (state.currentLevel == null) {
      return null;
    }
    const min = state.minLevel ?? 0;
    const max = state.maxLevel ?? 254;
    return (state.currentLevel - min) / (max - min);
  }, [state]);

  if (percentage == null) {
    return <></>;
  } else {
    return <>{Math.round(percentage * 100)} %</>;
  }
};
