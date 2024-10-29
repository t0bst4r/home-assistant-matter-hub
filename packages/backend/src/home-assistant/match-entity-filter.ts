import {
  HomeAssistantEntityRegistryWithInitialState,
  HomeAssistantFilter,
  HomeAssistantMatcher,
} from "@home-assistant-matter-hub/common";

export function matchEntityFilter(
  entity: HomeAssistantEntityRegistryWithInitialState,
  filter: HomeAssistantFilter,
): boolean {
  const included =
    filter.include.length === 0 ||
    filter.include.some((matcher) => testMatcher(entity, matcher));
  const excluded =
    filter.exclude.length > 0 &&
    filter.exclude.some((matcher) => testMatcher(entity, matcher));
  return included && !excluded;
}

export function testMatcher(
  entity: HomeAssistantEntityRegistryWithInitialState,
  matcher: HomeAssistantMatcher,
): boolean {
  switch (matcher.type) {
    case "domain":
      return entity.entity_id.split(".")[0] === matcher.value;
    case "label":
      return !!entity.labels && entity.labels.includes(matcher.value);
    case "platform":
      return entity.platform === matcher.value;
    case "pattern":
      return patternToRegex(matcher.value).test(entity.entity_id);
  }
  return false;
}

function escapeRegExp(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function patternToRegex(pattern: string): RegExp {
  const regex = pattern
    .split("*")
    .map((part) => escapeRegExp(part))
    .join(".*");
  return new RegExp(regex);
}
