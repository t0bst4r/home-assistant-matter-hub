import { FormControl, InputLabel, Select } from "@mui/material";
import { PropsWithChildren, useMemo } from "react";

export interface SelectFieldProps<T = unknown> extends PropsWithChildren {
  fullWidth?: boolean;
  label: string;
  value: T;
  onChange: (value: T) => void;
}

let nextLabelId = 1;

export const SelectField = <T = unknown,>(props: SelectFieldProps<T>) => {
  const labelId = useMemo(() => `select-form-label-${nextLabelId++}`, []);
  return (
    <FormControl fullWidth={props.fullWidth}>
      <InputLabel id={labelId}>{props.label}</InputLabel>
      <Select
        variant="outlined"
        labelId={labelId}
        value={props.value}
        label={props.label}
        onChange={(val) => props.onChange(val.target.value as T)}
      >
        {props.children}
      </Select>
    </FormControl>
  );
};
