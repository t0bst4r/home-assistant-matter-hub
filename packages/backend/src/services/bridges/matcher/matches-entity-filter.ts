import type {
  HomeAssistantDeviceRegistry,
  HomeAssistantEntityRegistry,
  HomeAssistantMatcher,
} from "@home-assistant-matter-hub/common";

export function testMatchers(
  matcher: HomeAssistantMatcher[],
  device: HomeAssistantDeviceRegistry | undefined,
  entity: HomeAssistantEntityRegistry,
) {
  return matcher.some((matcher) => testMatcher(matcher, device, entity));
}

export function testMatcher(
  matcher: HomeAssistantMatcher,
  device: HomeAssistantDeviceRegistry | undefined,
  entity: HomeAssistantEntityRegistry,
): boolean {
  switch (matcher.type) {
    case "domain":
      return entity.entity_id.split(".")[0] === matcher.value;
    case "label":
      return !!entity?.labels && entity?.labels.includes(matcher.value);
    case "entity_category":
      return entity?.entity_category === matcher.value;
    case "platform":
      return entity?.platform === matcher.value;
    case "pattern":
      return patternToRegex(matcher.value).test(entity.entity_id);
    case "area":
      return (entity?.area_id ?? device?.area_id) === matcher.value;
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
  return new RegExp(`^${regex}$`);
}
