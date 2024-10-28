import { BridgedDeviceBasicInformationServer as Base } from "@project-chip/matter.js/behavior/definitions/bridged-device-basic-information";
import {
  BridgeBasicInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Behavior } from "@project-chip/matter.js/behavior";
import crypto from "node:crypto";

export class BasicInformationServer extends Base {}

export namespace BasicInformationServer {
  export function createState(
    basicInformation: BridgeBasicInformation,
    state: HomeAssistantEntityState,
  ): Behavior.Options<typeof BasicInformationServer> {
    return {
      vendorId: basicInformation.vendorId,
      vendorName: maxLengthOrHash(basicInformation.vendorName, 32),
      productName: maxLengthOrHash(basicInformation.productName, 32),
      productLabel: maxLengthOrHash(basicInformation.productLabel, 64),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      nodeLabel: maxLengthOrHash(
        state.attributes.friendly_name ?? "Unknown Entity",
        32,
      ),
      reachable: true,
    };
  }
}

function maxLengthOrHash(value: string, maxLength: number): string {
  if (maxLength < 16) {
    throw new Error("MaxLength cannot be shorter than 16");
  }
  if (value.length < maxLength) {
    return value;
  } else {
    const hash = crypto
      .createHash("md5")
      .update(value)
      .digest("hex")
      .substring(0, 8);
    return value.substring(0, maxLength - 8) + hash;
  }
}
