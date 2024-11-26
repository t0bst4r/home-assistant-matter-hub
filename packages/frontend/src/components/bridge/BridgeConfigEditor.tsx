import {
  BridgeConfig,
  bridgeConfigSchema,
} from "@home-assistant-matter-hub/common";
import type { JSONSchema7 } from "json-schema";
import { JsonEditor } from "../misc/JsonEditor.tsx";
import { Box, Button, Typography } from "@mui/material";
import FieldsEditor from "../fields-editor/FieldsEditor.tsx";
import { useState } from "react";
import { LibraryBooks, TextFields } from "@mui/icons-material";

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
  isValid: boolean;
  onChange: (
    config: EditableBridgeConfig | undefined,
    isValid: boolean,
  ) => void;
}

enum EditionModeType {
  JSON_EDITOR = "JSON_EDITOR",
  FIELDS_EDITOR = "FIELDS_EDITOR",
}

export const BridgeConfigEditor = ({
  config,
  onChange,
  isValid,
}: BridgeConfigEditorProps) => {
  const [editionMode, setEditionMode] = useState(EditionModeType.FIELDS_EDITOR);
  const valueChanged = (event: {
    isValid: boolean;
    value?: EditableBridgeConfig;
  }) => {
    onChange(event.value, event.isValid);
  };

  const handdleChangeEditionType = () => {
    setEditionMode(
      editionMode === EditionModeType.FIELDS_EDITOR
        ? EditionModeType.JSON_EDITOR
        : EditionModeType.FIELDS_EDITOR,
    );
  };

  return (
    <Box position="relative">
      <Typography gutterBottom variant="h5" component="div">
        {editionMode === EditionModeType.FIELDS_EDITOR
          ? "Fields Editor"
          : "Json Editor"}
      </Typography>
      <Button
        sx={{
          position: "absolute",
          right: "0",
          top: "0",
        }}
        onClick={() => handdleChangeEditionType()}
        disabled={!isValid}
      >
        {editionMode === EditionModeType.FIELDS_EDITOR ? (
          <TextFields />
        ) : (
          <LibraryBooks />
        )}
      </Button>

      {editionMode === EditionModeType.FIELDS_EDITOR && (
        <FieldsEditor value={config} onChange={valueChanged} />
      )}
      {editionMode === EditionModeType.JSON_EDITOR && (
        <JsonEditor
          value={config}
          onChange={valueChanged}
          schema={editableConfigSchema}
        />
      )}
    </Box>
  );
};
