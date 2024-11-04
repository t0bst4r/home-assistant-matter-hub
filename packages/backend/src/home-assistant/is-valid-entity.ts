import { HomeAssistantEntityRegistry } from "@home-assistant-matter-hub/common";

export function isValidEntity(registry: HomeAssistantEntityRegistry): boolean {
  if (registry.disabled_by != null) {
    return false;
  } else if (registry.hidden_by != null) {
    return false;
  }
  return true;
}
