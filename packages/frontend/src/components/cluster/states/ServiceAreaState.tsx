import type { ServiceAreaClusterState } from "@home-assistant-matter-hub/common";

export interface ServiceAreaStateProps {
  state: ServiceAreaClusterState;
}

export const ServiceAreaState = (_: ServiceAreaStateProps) => {
  return <></>;
};
