import { BridgedDeviceBasicInformationServer as Base } from "@project-chip/matter.js/behavior/definitions/bridged-device-basic-information";
import {
  BridgeBasicInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";

export class BasicInformationServer extends Base {}

export namespace BasicInformationServer {
  export function createState(
    basicInformation: BridgeBasicInformation,
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof BasicInformationServer> {
    return {
      vendorId: basicInformation.vendorId,
      vendorName: basicInformation.vendorName,
      productName: basicInformation.productName,
      productLabel: basicInformation.productLabel,
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      nodeLabel: state.attributes.friendly_name ?? "Unknown Entity",
      reachable: true,
    };
  }
}
