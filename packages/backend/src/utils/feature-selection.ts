import type { ClusterType } from "@matter/main/types";

export type Feature<T extends ClusterType> = Capitalize<
  string & keyof T["features"]
>;

export type FeatureSelection<T extends ClusterType> =
  | Set<Feature<T>>
  | Feature<T>[];
