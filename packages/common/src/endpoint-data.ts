export interface EndpointData {
  id: { global: string; local: string };
  type: { name: string; id: string };
  endpoint: number;
  state: object;
  parts: EndpointData[];
}
