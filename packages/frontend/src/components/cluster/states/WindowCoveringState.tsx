import { WindowCoveringClusterState } from "@home-assistant-matter-hub/common";

export interface WindowCoveringStateProps {
  state: WindowCoveringClusterState;
}

export const WindowCoveringState = ({ state }: WindowCoveringStateProps) => {
  if (state.currentPositionLiftPercent100ths == null) {
    return <></>;
  }
  return <>{Math.round(state.currentPositionLiftPercent100ths / 100)} %</>;
};
