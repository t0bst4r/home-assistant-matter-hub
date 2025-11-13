export interface EndpointData {
  id: { global: string; local: string };
  type: { name: string; id: string };
  endpoint: number;
  state: object;
  parts: EndpointData[];
}

export interface CoverMappingOptions {
  entityId: string;
  deviceClass?: string;
  inferredType?: "standard" | "garage" | "other";
  invertPercentage?: boolean;
  swapOpenClose?: boolean;
}
