import { Box } from "@mui/material";
import { HomeAssistantMatcher } from "@home-assistant-matter-hub/common";
import { FilterEditor } from "./filterEditor";
import { type EditableBridgeConfig } from "../bridge/BridgeConfigEditor";

interface FieldsEditorProps {
  value: EditableBridgeConfig;
  onChange: (event: { value: EditableBridgeConfig; isValid: boolean }) => void;
}

export const FieldsEditor = ({ value, onChange }: FieldsEditorProps) => {
  const handleOnChange = (
    newIncludesValue: HomeAssistantMatcher[],
    key: "include" | "exclude",
  ) => {
    const data: EditableBridgeConfig = JSON.parse(JSON.stringify(value));
    data.filter[key] = newIncludesValue;

    const includesFiltered = data.filter.include.find(
      (e) => !e.type || !e.value,
    );
    const excludeFiltered = data.filter.exclude.find(
      (e) => !e.type || !e.value,
    );

    const isValid = includesFiltered || excludeFiltered;
    onChange({ isValid: !isValid, value: data });
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <FilterEditor
        title="Includes"
        values={value.filter.include}
        onChange={(newIncludesValue) =>
          handleOnChange(newIncludesValue, "include")
        }
      />
      <FilterEditor
        title="Excludes"
        values={value.filter.exclude}
        onChange={(newExcludesValue) =>
          handleOnChange(newExcludesValue, "exclude")
        }
      />
    </Box>
  );
};
