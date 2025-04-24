import { WaterLeakDetectorDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../behaviors/basic-information-server.js";
import { BooleanStateServer } from "../../behaviors/boolean-state-server.js";
import { IdentifyServer } from "../../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../../custom-behaviors/home-assistant-entity-behavior.js";

export const WaterLeakDetectorType = WaterLeakDetectorDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  BooleanStateServer(),
);
