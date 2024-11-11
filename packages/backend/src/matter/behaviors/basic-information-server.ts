import { BridgedDeviceBasicInformationServer as Base } from "@matter/main/behaviors";
import crypto from "node:crypto";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { VendorId } from "@matter/main";

export class BasicInformationServer extends Base {
  override async initialize(): Promise<void> {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    const { basicInformation, entity } = homeAssistant.state;
    this.state.vendorId = VendorId(basicInformation.vendorId);
    this.state.vendorName = maxLengthOrHash(basicInformation.vendorName, 32);
    this.state.productName = maxLengthOrHash(basicInformation.productName, 32);
    this.state.productLabel = maxLengthOrHash(
      basicInformation.productLabel,
      64,
    );
    this.state.hardwareVersion = basicInformation.hardwareVersion;
    this.state.softwareVersion = basicInformation.softwareVersion;
    this.state.nodeLabel = maxLengthOrHash(
      entity.attributes.friendly_name ?? "Unknown Entity",
      32,
    );
    this.state.reachable = true;
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
