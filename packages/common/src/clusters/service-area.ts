export interface ServiceAreaArea {
  mapId: number;
  name: string;
  [key: string]: unknown;
}

export interface ServiceAreaClusterState {
  areas: ServiceAreaArea[];
  [key: string]: unknown;
}
