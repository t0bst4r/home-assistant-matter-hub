import {
  HomeAssistantMatcher,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";
import { MatterElementFieldEditor } from "./MatterElementFieldEditor";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface EditionFilterProps {
  title: string;
  values: HomeAssistantMatcher[];
  onChange: (value: HomeAssistantMatcher[]) => void;
}

export const FilterEditor = ({
  title,
  values,
  onChange,
}: EditionFilterProps) => {
  const handleChange = (
    newMatterValue: HomeAssistantMatcher,
    index: number,
  ) => {
    const newValues = [...values];
    newValues[index] = newMatterValue;
    onChange(newValues);
  };

  const handleAddField = () => {
    const newValues = [...values];
    newValues.push({
      type: HomeAssistantMatcherType.Pattern,
      value: "",
    });
    onChange(newValues);
  };

  const handleDeleteElement = (index: number) => {
    const newValues = [...values];
    onChange(newValues.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography gutterBottom variant="h6" component="div">
            {title}
          </Typography>
          <Divider />
          {values.map((e, idx) => (
            <MatterElementFieldEditor
              key={`filter-${idx}`}
              value={e}
              onChange={(newValue) => handleChange(newValue, idx)}
              onDelete={() => handleDeleteElement(idx)}
            />
          ))}
          <Button variant="text" onClick={handleAddField} fullWidth>
            <AddCircleOutlineIcon />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
