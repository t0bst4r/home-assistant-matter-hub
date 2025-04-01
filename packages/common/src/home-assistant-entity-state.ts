export type HomeAssistantEntityStateAttributes<T extends object = object> = {
  friendly_name?: string;
  unit_of_measurement?: string;
  icon?: string;
  entity_picture?: string;
  supported_features?: number;
  hidden?: boolean;
  assumed_state?: boolean;
  device_class?: string;
  state_class?: string;
  restored?: boolean;
} & T;

export interface HomeAssistantEntityState<T extends object = object> {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: HomeAssistantEntityStateAttributes<T>;
  context: {
    id: string;
    user_id?: string | null;
    parent_id?: string | null;
  };
}
