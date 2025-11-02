import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import type {
  CustomValidator,
  FormValidation,
  RJSFValidationError,
  UiSchema,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import type { JSONSchema7 } from "json-schema";
import { useCallback } from "react";
import type { ValidationError } from "./validation-error.ts";

const Form = withTheme(Theme);

export interface FormEditorProps {
  schema: JSONSchema7;
  uiSchema?: UiSchema;
  value: object;
  onChange: (value: object, isValid: boolean) => void;
  customValidate?: (value: object | undefined) => ValidationError[];
}

export const FormEditor = (props: FormEditorProps) => {
  const onChange = (data: object, errors: RJSFValidationError[]) => {
    props.onChange(data, errors.length === 0);
  };

  const customValidate = props.customValidate;
  const customValidator: CustomValidator = useCallback(
    (formData, errors) => {
      const validationErrors = customValidate?.(formData) ?? [];
      validationErrors.forEach((error) => {
        if (!error.message) {
          return;
        }
        const path = error.instancePath.split("/");
        let nestedError: FormValidation = errors;
        for (const part of path) {
          if (part === "") continue;
          nestedError = nestedError[part] ?? nestedError;
        }
        nestedError.addError(error.message!);
      });
      return errors;
    },
    [customValidate],
  );

  return (
    <Form
      schema={props.schema}
      uiSchema={props.uiSchema}
      validator={validator}
      formData={props.value}
      liveValidate="onChange"
      customValidate={customValidator}
      showErrorList={false}
      onChange={(data) => onChange(data.formData, data.errors)}
    />
  );
};
