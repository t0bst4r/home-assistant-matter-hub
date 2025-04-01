import type { ClusterId } from "@home-assistant-matter-hub/common";
import { useEffect } from "react";
import { CopyToClipboard } from "../misc/CopyToClipboard.tsx";
import { UnknownClusterState } from "./UnknownClusterState.tsx";
import { clusterRenderers } from "./states";

export interface ClusterStateProps {
  clusterId: ClusterId | string;
  state: unknown;
}

const ErrorRenderer = (props: { clusterId: string; state: unknown }) => {
  useEffect(() => {
    console.warn(`No supported State Renderer for '${props.clusterId}'`);
    console.debug(props.state);
  }, [props]);
  return <UnknownClusterState />;
};

export const ClusterState = ({ clusterId, state }: ClusterStateProps) => {
  const configuredComponent = clusterRenderers[clusterId as ClusterId];
  const Component =
    configuredComponent === null
      ? null
      : (configuredComponent ?? ErrorRenderer);

  if (Component === null) {
    return <></>;
  }
  return (
    <CopyToClipboard
      text={
        <>
          {clusterId}
          <br />
          click to copy the state to clipboard
        </>
      }
      getValue={() => JSON.stringify(state, null, 2)}
    >
      <Component state={state} clusterId={clusterId} />
    </CopyToClipboard>
  );
};
