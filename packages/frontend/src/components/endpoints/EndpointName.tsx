import type { EndpointData } from "@home-assistant-matter-hub/common";

export interface EndpointNameProps {
  endpoint: EndpointData;
}

export const EndpointName = ({ endpoint }: EndpointNameProps) => {
  return getName(endpoint.state) ?? endpoint.id.local;
};

function getName(state: object) {
  if ("basicInformation" in state) {
    const basicInformation = state.basicInformation as { nodeLabel: string };
    return basicInformation.nodeLabel;
  }
  if ("bridgedDeviceBasicInformation" in state) {
    const basicInformation = state.bridgedDeviceBasicInformation as {
      nodeLabel: string;
    };
    return basicInformation.nodeLabel;
  }
  return undefined;
}
