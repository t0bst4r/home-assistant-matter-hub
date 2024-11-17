import { useEffect, useState } from "react";
import ReactCodeMirror, { hoverTooltip } from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Alert, Button, useTheme } from "@mui/material";
import { linter } from "@codemirror/lint";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";
import {
  handleRefresh,
  jsonCompletion,
  jsonSchemaHover,
  jsonSchemaLinter,
  stateExtensions,
} from "codemirror-json-schema";
import Box from "@mui/material/Box";
import Ajv, { ErrorObject } from "ajv";
import type { JSONSchema7 } from "json-schema";

type OnChangeParams<T extends {}> =
  | { value: T; isValid: true }
  | { isValid: false };

export interface JsonEditorProps<T extends {}> {
  schema?: JSONSchema7;
  value: T;
  onChange: (event: OnChangeParams<T>) => void;
}

const ajv = new Ajv();

export const JsonEditor = <T extends {}>({
  value,
  schema,
  onChange,
}: JsonEditorProps<T>) => {
  const codeMirrorTheme = useCodeTheme();

  const [validationErrors, setValidationErrors] = useState<ErrorObject[]>();
  const [stringValue, setStringValue] = useState(() => JSON.stringify(value));
  const [lastPopulatedValue, setLastPopulatedValue] = useState<T>();

  const parse = (value: string): OnChangeParams<T> => {
    try {
      const parsedConfig = JSON.parse(value) as T;
      if (schema) {
        const isValid = ajv.validate(schema, parsedConfig);
        setValidationErrors(ajv.errors ?? undefined);
        if (!isValid) {
          return { isValid: false };
        }
      }
      return { isValid: true, value: parsedConfig };
    } catch (_: unknown) {
      return { isValid: false };
    }
  };

  const valueChanged = (value: string, prettify?: boolean) => {
    const event = parse(value);
    if (event.isValid) {
      setLastPopulatedValue(event.value);
      if (prettify) {
        value = JSON.stringify(event.value, null, 2);
      }
    }
    onChange(event);
    setStringValue(value);
  };

  useEffect(() => {
    if (lastPopulatedValue !== value) {
      setStringValue(JSON.stringify(value, null, 2));
    }
  }, [lastPopulatedValue, value]);

  return (
    <>
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
            stateExtensions(schema),
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
          onClick={() => valueChanged(stringValue, true)}
        >
          Prettify
        </Button>
      </Box>
      {validationErrors && (
        <Alert severity="error" variant="outlined">
          <ul>
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <code>{error.instancePath}</code>{" "}
                <span>
                  {error.message} (
                  <code>{Object.values(error.params).join(", ")}</code>)
                </span>
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </>
  );
};

function useCodeTheme() {
  const theme = useTheme();
  if (theme.palette.mode === "dark") {
    return vscodeDark;
  } else {
    return vscodeLight;
  }
}
