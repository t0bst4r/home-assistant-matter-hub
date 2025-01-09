import { OnOffPlugInUnitDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { EndpointType } from "@matter/main";
import { AutoOffServer } from "../behaviors/auto-off-server.js";

const ButtonEndpointType = OnOffPlugInUnitDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  AutoOffServer.set({
    config: {
      turnOn: {
        action: "button.press",
      },
    },
  }),
);

export function ButtonDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  return ButtonEndpointType.set({ homeAssistantEntity });
}
