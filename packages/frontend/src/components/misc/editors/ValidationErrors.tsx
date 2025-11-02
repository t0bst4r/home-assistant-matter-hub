import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ValidationError } from "./validation-error";

export interface ValidationErrorProps {
  validationErrors: ValidationError[];
}

export const ValidationErrors = (props: ValidationErrorProps) => {
  return (
    <List disablePadding>
      {props.validationErrors.map((error, idx) => (
        <ListItem disableGutters disablePadding key={idx.toString()}>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2">&bull;</Typography>
            <Typography variant="caption">
              {error.instancePath.length === 0 ? "/" : error.instancePath}
            </Typography>
            <Typography variant="body2">{error.message}</Typography>
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};
