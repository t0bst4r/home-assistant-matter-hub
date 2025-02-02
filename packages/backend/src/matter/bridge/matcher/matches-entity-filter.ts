import {
  HomeAssistantEntityInformation,
  HomeAssistantFilter,
  HomeAssistantMatcher,
} from "@home-assistant-matter-hub/common";

export function matchesEntityFilter(
  filter: HomeAssistantFilter,
  entity: HomeAssistantEntityInformation,
): string[] | undefined {
  const reasons: string[] = [];
  if (filter.include.length > 0) {
    if (!filter.include.some((matcher) => testMatcher(entity, matcher))) {
      reasons.push("not included");
    }
  }
  if (filter.exclude.length > 0) {
    const exclusions = filter.exclude
      .map((matcher, idx) => (testMatcher(entity, matcher) ? idx : undefined))
      .filter((idx) => idx != undefined);
    if (exclusions.length) {
      exclusions
        .map((exclusionIdx) => `excluded by filter: ${exclusionIdx + 1}`)
        .forEach((reason) => reasons.push(reason));
    }
  }
  if (reasons.length) {
    return reasons;
  }
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
    case "entity_category":
      return entity.registry?.entity_category === matcher.value;
    case "platform":
      return entity.registry?.platform === matcher.value;
    case "pattern":
      return patternToRegex(matcher.value).test(entity.entity_id);
    case "area":
      return (
        (entity.registry?.area_id ?? entity.deviceRegistry?.area_id) ===
        matcher.value
      );
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
