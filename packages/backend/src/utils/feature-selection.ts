import { ClusterType } from "@matter/main/types";

export type FeatureSelection<T extends ClusterType> = Set<
  Capitalize<string & keyof T["features"]>
>;
