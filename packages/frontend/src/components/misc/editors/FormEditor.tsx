import type { JSONSchema7 } from "json-schema";
import { withTheme } from "@rjsf/core";
import {
  CustomValidator,
  FormValidation,
  RJSFValidationError,
} from "@rjsf/utils";
import { Theme } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { ValidationError } from "./validation-error.ts";
import { useCallback } from "react";

const Form = withTheme(Theme);

export interface FormEditorProps {
  schema: JSONSchema7;
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
      validator={validator}
      formData={props.value}
      liveValidate
      customValidate={customValidator}
      showErrorList={false}
      onChange={(data) => onChange(data.formData, data.errors)}
    >
      <div />
    </Form>
  );
};
