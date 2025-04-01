import {
  type RvcOperationalStateClusterState,
  RvcOperationalState as RvcOperationalStateEnum,
} from "@home-assistant-matter-hub/common";

export interface RvcOperationalStateProps {
  state: RvcOperationalStateClusterState;
}

const stateNames = Object.fromEntries(
  Object.entries(RvcOperationalStateEnum).map(([key, value]) => [value, key]),
);

export const RvcOperationalState = (props: RvcOperationalStateProps) => {
  return <>{stateNames[props.state.operationalState]}</>;
};
