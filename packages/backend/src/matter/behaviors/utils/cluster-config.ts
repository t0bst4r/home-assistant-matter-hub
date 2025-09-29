import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import type { HomeAssistantAction } from "../../../services/home-assistant/home-assistant-actions.js";

export type ValueGetter<T> = (
  entity: HomeAssistantEntityState,
  agent: Agent,
) => T;

export type ValueSetter<T> = (value: T, agent: Agent) => HomeAssistantAction;
