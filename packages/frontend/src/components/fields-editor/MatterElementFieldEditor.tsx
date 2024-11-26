import {
  Button,
  Divider,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  type HomeAssistantMatcher,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";

interface MatterElementFieldEditorProps {
  value: HomeAssistantMatcher;
  onChange: (value: HomeAssistantMatcher) => void;
  onDelete: () => void;
}

export const MatterElementFieldEditor = ({
  value,
  onChange,
  onDelete,
}: MatterElementFieldEditorProps) => {
  const handleOnChange = (newFieldValue: string, key: "type" | "value") => {
    onChange({
      ...value,
      [key]: newFieldValue,
    });
  };
  return (
    <>
      <Grid2 container spacing={{ md: 1, xs: 1.5 }} size={12}>
        <Grid2 size={{ xs: 12, sm: 3, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="select-field-type">Type</InputLabel>
            <Select
              onChange={(event) =>
                handleOnChange(
                  event.target.value as HomeAssistantMatcherType,
                  "type",
                )
              }
              labelId="select-field-type"
              id="demo-simple-select"
              value={value.type}
              label="Age"
            >
              {Object.entries(HomeAssistantMatcherType).map((e) => (
                <MenuItem value={e[1]} key={e[1]}>
                  {e[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 7, md: 9 }}>
          <TextField
            onChange={(event) =>
              handleOnChange(event.target.value as string, "value")
            }
            label="Value"
            variant="outlined"
            value={value.value}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 2, md: 1 }}>
          <Button
            style={{ height: "100%", width: "100%", minHeight: 0 }}
            size={"small"}
            variant="outlined"
            color="error"
            onClick={onDelete}
          >
            <DeleteOutlineIcon />
          </Button>
        </Grid2>
      </Grid2>
      <Stack>
        <Divider />
      </Stack>
    </>
  );
};
