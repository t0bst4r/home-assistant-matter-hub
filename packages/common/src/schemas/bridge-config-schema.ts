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
    mimicHaCoverPercentage: {
      title: "Mimic Cover Percentage from Home Assistant",
      description:
        "This will NOT invert percentages (=> HA = Matter), but it will swap 0% and 100% because those are used for 'open' and 'close' commands.",
      type: "boolean",
      default: false,
    },
    includeHiddenEntities: {
      title: "Include Hidden Entities",
      description:
        "Include entities that are marked as hidden in Home Assistant",
      type: "boolean",
      default: false,
    },
    useOnOffSensorAsDefaultForBinarySensors: {
      title: "Use On/Off Sensor as default device class for Binary Sensors",
      description: "This is only supported by Google Home (as of 2025-02-23)",
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
    countryCode: {
      title: "Country Code",
      type: "string",
      description:
        "An ISO 3166-1 alpha-2 code to represent the country in which the Node is located. Only needed if the commissioning fails due to missing country code.",
      minLength: 2,
      maxLength: 3,
    },
    filter: homeAssistantFilterSchema,
    featureFlags: featureFlagSchema,
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
