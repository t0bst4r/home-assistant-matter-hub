import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror, { hoverTooltip } from "@uiw/react-codemirror";
import Ajv from "ajv";
import {
  handleRefresh,
  jsonCompletion,
  jsonSchemaHover,
  jsonSchemaLinter,
  stateExtensions,
} from "codemirror-json-schema";
import type { JSONSchema7 } from "json-schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ValidationErrors } from "./ValidationErrors.tsx";
import type { ValidationError } from "./validation-error.ts";

export interface JsonEditorProps {
  schema: JSONSchema7;
  value: object;
  onChange: (value: object | undefined, isValid: boolean) => void;
  customValidate?: (value: object | undefined) => ValidationError[];
}

const parse = (value: string): object | undefined => {
  let result: object | undefined;
  try {
    result = JSON.parse(value);
  } catch {
    result = undefined;
  }
  return result;
};

function useValidator({ schema, customValidate }: JsonEditorProps) {
  const ajv = useMemo(() => new Ajv({ allErrors: true }), []);
  return useCallback(
    (value: object | undefined) => {
      const errors: ValidationError[] = [];
      ajv.validate(schema, value);
      errors.push(...(ajv.errors ?? []));
      errors.push(...(customValidate?.(value) ?? []));
      return errors;
    },
    [ajv, schema, customValidate],
  );
}

export const JsonEditor = (props: JsonEditorProps) => {
  const codeMirrorTheme = useCodeTheme();

  const [stringValue, setStringValue] = useState(() =>
    JSON.stringify(props.value, null, 2),
  );

  const validate = useValidator(props);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    setErrors(validate(props.value));
  }, [validate, props.value]);

  const onChange = props.onChange;
  const valueChanged = useCallback(
    (value: string) => {
      const parsedValue = parse(value);
      const errors = validate(parsedValue);
      onChange(parsedValue, errors.length === 0);
      setStringValue(value);
      setErrors(errors);
    },
    [validate, onChange],
  );

  const prettify = () => {
    const event = parse(stringValue);
    if (event) {
      setStringValue(JSON.stringify(event, null, 2));
    }
  };

  return (
    <Stack spacing={2}>
      <Box position="relative">
        <ReactCodeMirror
          value={stringValue}
          onChange={(value) => valueChanged(value)}
          extensions={[
            json(),
            linter(jsonParseLinter(), {
              delay: 100,
            }),
            linter(jsonSchemaLinter(), {
              delay: 100,
              needsRefresh: handleRefresh,
            }),
            jsonLanguage.data.of({
              autocomplete: jsonCompletion({ mode: "json4" }),
            }),
            hoverTooltip(jsonSchemaHover()),
            stateExtensions(props.schema),
          ]}
          theme={codeMirrorTheme}
          height="400px"
        />
        <Button
          sx={{
            position: "absolute",
            right: "0",
            bottom: "0",
          }}
          onClick={() => prettify()}
        >
          Prettify
        </Button>
      </Box>
      {errors.length > 0 && (
        <Alert severity="error" variant="outlined">
          <ValidationErrors validationErrors={errors} />
        </Alert>
      )}
    </Stack>
  );
};

function useCodeTheme() {
  const theme = useTheme();
  if (theme.palette.mode === "dark") {
    return vscodeDark;
  }
  return vscodeLight;
}
