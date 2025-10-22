import type { EndpointType } from "@matter/main";
import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";

const InputButtonOnOffServer = OnOffServer({
  isOn: () => false,
  turnOn: () => ({
    action: "input_button.press",
  }),
  turnOff: null,
}).with("Lighting");

const InputButtonEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  InputButtonOnOffServer,
);

export function InputButtonDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return InputButtonEndpointType.set({ homeAssistantEntity });
}
