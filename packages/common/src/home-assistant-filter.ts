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
}

export interface HomeAssistantFilter {
  include: HomeAssistantMatcher[];
  exclude: HomeAssistantMatcher[];
}
