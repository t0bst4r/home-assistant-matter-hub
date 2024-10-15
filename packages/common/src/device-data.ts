export interface DeviceData {
  readonly entityId: string;
  readonly endpointCode: string;
  readonly endpointType: string;
  readonly state: Record<string, object>;
}
