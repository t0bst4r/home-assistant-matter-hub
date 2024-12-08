import type { JSONSchema7 } from "json-schema";
import { HomeAssistantMatcherType } from "../home-assistant-filter.js";

const homeAssistantMatcherSchema: JSONSchema7 = {
  type: "object",
  default: { type: "", value: "" },
  properties: {
    type: {
      title: "Type",
      type: "string",
      enum: Object.values(HomeAssistantMatcherType),
    },
    value: {
      title: "Value",
      type: "string",
      minLength: 1,
    },
  },
  required: ["type", "value"],
  additionalProperties: false,
};

const homeAssistantFilterSchema: JSONSchema7 = {
  title: "Include or exclude entities",
  type: "object",
  properties: {
    include: {
      title: "Include",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
    exclude: {
      title: "Exclude",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
  },
  required: ["include", "exclude"],
  additionalProperties: false,
};

const featureFlagSchema: JSONSchema7 = {
  title: "Feature Flags",
  type: "object",
  properties: {
    matterSpeakers: {
      title:
        "Expose TVs and Speakers as speaker devices (on-off and volume only)",
      description:
        "Some controllers like Alexa don't support speakers via Matter",
      type: "boolean",
      default: false,
    },
    matterFans: {
      title: "Full matter conformance for fans",
      description:
        "Most controllers only support 'off' and 'high', but not 'low' or 'medium'.",
      type: "boolean",
      default: false,
    },
  },
  additionalProperties: false,
};

export const bridgeConfigSchema: JSONSchema7 = {
  type: "object",
  title: "Bridge Config",
  properties: {
    name: {
      title: "Name",
      type: "string",
      minLength: 1,
    },
    port: {
      title: "Port",
      type: "number",
      minimum: 1,
    },
    filter: homeAssistantFilterSchema,
    featureFlags: featureFlagSchema,
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
