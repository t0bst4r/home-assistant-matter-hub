export enum HomeAssistantMatcherType {
  Pattern = "pattern",
  Domain = "domain",
  Platform = "platform",
  Label = "label",
  Area = "area",
  EntityCategory = "entity_category",
}

export interface HomeAssistantMatcher {
  readonly type: HomeAssistantMatcherType;
  readonly value: string;
  readonly invert?: boolean;
}

export interface HomeAssistantFilter {
  exclusive: boolean;
  include: HomeAssistantMatcher[];
  exclude: HomeAssistantMatcher[];
}
