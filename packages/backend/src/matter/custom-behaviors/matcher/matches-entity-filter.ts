import {
  HomeAssistantEntityInformation,
  HomeAssistantFilter,
  HomeAssistantMatcher,
} from "@home-assistant-matter-hub/common";

export function matchesEntityFilter(
  filter: HomeAssistantFilter,
  entity: HomeAssistantEntityInformation,
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
  entity: HomeAssistantEntityInformation,
  matcher: HomeAssistantMatcher,
): boolean {
  switch (matcher.type) {
    case "domain":
      return entity.entity_id.split(".")[0] === matcher.value;
    case "label":
      return (
        !!entity.registry?.labels &&
        entity.registry.labels.includes(matcher.value)
      );
    case "platform":
      return entity.registry?.platform === matcher.value;
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
  return new RegExp("^" + regex + "$");
}
