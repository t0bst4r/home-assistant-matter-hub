import {
  BridgeConfig,
  bridgeConfigSchema,
} from "@home-assistant-matter-hub/common";
import type { JSONSchema7 } from "json-schema";
import { JsonEditor } from "../misc/JsonEditor.tsx";

const ignoredProperties = ["name", "port"] as const;
type IgnoredProperties = (typeof ignoredProperties)[number];

export type EditableBridgeConfig = Omit<
  BridgeConfig,
  (typeof ignoredProperties)[number]
>;
const editableConfigSchema: JSONSchema7 = {
  ...bridgeConfigSchema,
  properties: {
    ...bridgeConfigSchema.properties,
  },
  required: bridgeConfigSchema.required?.filter(
    (it) => !ignoredProperties.includes(it as IgnoredProperties),
  ),
};
ignoredProperties.forEach((prop) => {
  if (editableConfigSchema.properties) {
    delete editableConfigSchema.properties[prop];
  }
});

export interface BridgeConfigEditorProps {
  config: EditableBridgeConfig;
  onChange: (
    config: EditableBridgeConfig | undefined,
    isValid: boolean,
  ) => void;
}

export const BridgeConfigEditor = ({
  config,
  onChange,
}: BridgeConfigEditorProps) => {
  const valueChanged = (event: {
    isValid: boolean;
    value?: EditableBridgeConfig;
  }) => {
    onChange(event.value, event.isValid);
  };

  return (
    <JsonEditor
      value={config}
      onChange={valueChanged}
      schema={editableConfigSchema}
    />
  );
};
