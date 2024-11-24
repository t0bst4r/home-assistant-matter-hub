import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { EditableBridgeConfig } from "../bridge/BridgeConfigEditor";
import {
  HomeAssistantMatcher,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";
import Divider from "@mui/material/Divider";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface FieldsEditorProps {
  value: EditableBridgeConfig;
  onChange: (value: EditableBridgeConfig) => void;
}

const FieldsEditor = ({ value, onChange }: FieldsEditorProps) => {
  const handleOnChange = (
    newIncludesValue: HomeAssistantMatcher[],
    key: "include" | "exclude",
  ) => {
    const data = JSON.parse(JSON.stringify(value));
    data.filter[key] = newIncludesValue;
    onChange(data);
  };

  return (
    <>
      <EditionFilter
        title="Includes"
        values={value.filter.include}
        onChange={(newIncludesValue) =>
          handleOnChange(newIncludesValue, "include")
        }
      />
      <EditionFilter
        title="Excludes"
        values={value.filter.exclude}
        onChange={(newExcludesValue) =>
          handleOnChange(newExcludesValue, "exclude")
        }
      />
    </>
  );
};

interface EditionFilterProps {
  title: string;
  values: HomeAssistantMatcher[];
  onChange: (value: HomeAssistantMatcher[]) => void;
}

const EditionFilter = ({
  title,
  values,
  onChange,
}: EditionFilterProps) => {
  const handdleChange = (
    newMatterValue: HomeAssistantMatcher,
    index: number,
  ) => {
    const newValues = [...values];
    newValues[index] = newMatterValue;
    onChange(newValues);
  };

  const handdleOnAddField = () => {
    const newValues = [...values];
    newValues.push({
      type: HomeAssistantMatcherType.Pattern,
      value: "",
    });
    onChange(newValues);
  };

  const onDeleteElement = (index: number) => {
    const newValues = [...values];
    onChange(newValues.filter((_, i) => i !== index));
  };

  return (
    <>
      <Card
        style={{
          marginTop: "1rem",
        }}
      >
        <CardContent>
          <Grid2 container rowSpacing={2} >
            <Grid2 size={12}   >
              <Typography gutterBottom variant="h6" component="div">
                {title}
              </Typography>
            </Grid2>
            <Grid2 size={12} >
              <Divider  />
            </Grid2>
            {values.map((e, idx) => (
              <Filter
                key={`filter-${idx}`}
                value={e}
                onChange={(newValue) => handdleChange(newValue, idx)}
                onDelete={() => onDeleteElement(idx)}
              />
          
            ))}
            
            <Grid2 size={12} >
              <Button variant="text" onClick={handdleOnAddField} fullWidth>
                <AddCircleOutlineIcon />
              </Button>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
    </>
  );
};

interface FilterProps {
  value: HomeAssistantMatcher;
  onChange: (value: HomeAssistantMatcher) => void;
  onDelete: () => void;
}

const Filter = ({ value, onChange, onDelete }: FilterProps) => {
  const handleOnChange = (newFieldValue: string, key: "type" | "value") => {
    onChange({
      ...value,
      [key]: newFieldValue,
    });
  };
  return (
    <>
      <Grid2 container spacing={{md: 1, xs:1.5}} size={12}>
        <Grid2 size={{xs: 12, sm: 3, md: 2}}>
          <FormControl fullWidth>
            <InputLabel id="select-field-type">Type</InputLabel>
            <Select
              onChange={(event) =>
                handleOnChange(event.target.value as any, "type")
              }
              labelId="select-field-type"
              id="demo-simple-select"
              value={value.type}
              label="Age"
            >
              <MenuItem value={"pattern"}>Pattern</MenuItem>
              <MenuItem value={"domain"}>Domain</MenuItem>
              <MenuItem value={"platform"}>Platform</MenuItem>
              <MenuItem value={"label"}>Label</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{xs: 12, sm: 7, md: 9}}>
          <TextField
            onChange={(event) => handleOnChange(event.target.value as any, "value")}
            label="Value"
            variant="outlined"
            value={value.value}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{xs: 12, sm: 2, md: 1}} >
          <Button style={{height: "100%", width:"100%", minHeight: 0}} size={"small"} variant="outlined" color="error" onClick={onDelete}  >
            <DeleteOutlineIcon />
          </Button>
        </Grid2>
        
      </Grid2>
      <Grid2 size={12}>
        <Divider  />
      </Grid2>
    </>
  );
};

export default FieldsEditor;
