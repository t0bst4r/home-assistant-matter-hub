import { ClusterType } from "@matter/main/types";

export type FeatureSelection<T extends ClusterType> = Capitalize<
  string & keyof T["features"]
>[];
