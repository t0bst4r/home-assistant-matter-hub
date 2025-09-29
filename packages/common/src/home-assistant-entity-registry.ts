export interface HomeAssistantEntityRegistry {
  area_id?: string;
  categories?: Record<string, unknown>;
  config_entry_id?: unknown;
  device_id: string;
  disabled_by?: unknown;
  entity_category?: unknown;
  entity_id: string;
  has_entity_name?: boolean;
  hidden_by?: unknown;
  icon?: unknown;
  id?: string;
  labels?: string[];
  name?: string;
  options?: {
    conversation?: {
      should_expose?: boolean;
    };
  };
  original_name?: string;
  platform?: string;
  translation_key?: unknown;
  unique_id?: string;
}
