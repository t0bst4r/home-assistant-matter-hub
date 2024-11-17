import type { JSONSchema7 } from "json-schema";
import { HomeAssistantMatcherType } from "../home-assistant-filter.js";
import { HomeAssistantDomain } from "../home-assistant-domain.js";
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

const domainConfigSchema: Record<HomeAssistantDomain, JSONSchema7> = {
  [HomeAssistantDomain.light]: { type: "null" },
  [HomeAssistantDomain.switch]: { type: "null" },
  [HomeAssistantDomain.lock]: { type: "null" },
  [HomeAssistantDomain.fan]: { type: "null" },
  [HomeAssistantDomain.binary_sensor]: { type: "null" },
  [HomeAssistantDomain.sensor]: { type: "null" },
  [HomeAssistantDomain.cover]: { type: "null" },
  [HomeAssistantDomain.climate]: { type: "null" },
  [HomeAssistantDomain.input_boolean]: { type: "null" },
  [HomeAssistantDomain.script]: { type: "null" },
  [HomeAssistantDomain.automation]: { type: "null" },
  [HomeAssistantDomain.scene]: { type: "null" },
  [HomeAssistantDomain.media_player]: { type: "null" },
  [HomeAssistantDomain.humidifier]: { type: "null" },
};
const entityConfigSchema = Object.fromEntries(
  Object.entries(domainConfigSchema).map(([key, value]) => [
    `^${key}\\.\\w+$`,
    value,
  ]),
);

const bridgeOverridesSchema: JSONSchema7 = {
  type: "object",
  properties: {
    domains: {
      type: "object",
      properties: domainConfigSchema,
      additionalProperties: false,
    },
    entities: {
      type: "object",
      patternProperties: entityConfigSchema,
      additionalProperties: false,
    },
  },
  required: ["domains", "entities"],
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
    overrides: bridgeOverridesSchema,
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
