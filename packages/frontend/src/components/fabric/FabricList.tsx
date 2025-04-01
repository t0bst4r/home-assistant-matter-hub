import type { BridgeFabric } from "@home-assistant-matter-hub/common";
import { FabricIcon } from "./FabricIcon.tsx";

export interface FabricListProps {
  fabrics: BridgeFabric[];
}

export const FabricList = (props: FabricListProps) => {
  return (
    <>
      {props.fabrics.map((fabric) => (
        <FabricIcon key={fabric.fabricId} fabric={fabric} />
      ))}
    </>
  );
};
