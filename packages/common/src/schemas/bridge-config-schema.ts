import type { JSONSchema7 } from "json-schema";
import { HomeAssistantMatcherType } from "../home-assistant-filter.js";
import { CompatibilityMode } from "../compatibility-mode.js";

const homeAssistantMatcherSchema: JSONSchema7 = {
  type: "object",
  properties: {
    type: { type: "string", enum: Object.values(HomeAssistantMatcherType) },
    value: { type: "string", minLength: 1 },
  },
  required: ["type", "value"],
  additionalProperties: false,
};

const homeAssistantFilterSchema: JSONSchema7 = {
  type: "object",
  properties: {
    include: {
      type: "array",
      items: homeAssistantMatcherSchema,
    },
    exclude: {
      type: "array",
      items: homeAssistantMatcherSchema,
    },
  },
  required: ["include", "exclude"],
  additionalProperties: false,
};

export const bridgeConfigSchema: JSONSchema7 = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
    },
    port: {
      type: "number",
      minimum: 1,
    },
    compatibility: {
      type: "string",
      enum: Object.values(CompatibilityMode),
    },
    filter: homeAssistantFilterSchema,
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
