import { LevelControlClusterState } from "@home-assistant-matter-hub/common";

export interface LevelControlStateProps {
  state: LevelControlClusterState;
}

export const LevelControlState = ({ state }: LevelControlStateProps) => {
  return <>{Math.round((state.currentLevel / 254) * 100)} %</>;
};
