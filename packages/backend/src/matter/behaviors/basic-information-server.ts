import { BridgedDeviceBasicInformationServer as Base } from "@matter/main/behaviors";
import crypto from "node:crypto";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { VendorId } from "@matter/main";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";

export class BasicInformationServer extends Base {
  override async initialize(): Promise<void> {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    const { basicInformation, entity } = homeAssistant.state;
    Object.assign(this.state, {
      vendorId: VendorId(basicInformation.vendorId),
      vendorName: maxLengthOrHash(basicInformation.vendorName, 32),
      productName: maxLengthOrHash(basicInformation.productName, 32),
      productLabel: maxLengthOrHash(basicInformation.productLabel, 64),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      nodeLabel: maxLengthOrHash(
        entity.attributes.friendly_name ?? entity.entity_id,
        32,
      ),
      reachable: entity.state !== "unavailable",
    });
    homeAssistant.onChange.on(this.callback(this.update));
  }

  private update(entity: HomeAssistantEntityState) {
    const name = maxLengthOrHash(
      entity.attributes.friendly_name ?? entity.entity_id,
      32,
    );
    if (name !== this.state.nodeLabel) {
      this.state.nodeLabel = name;
    }
    const reachable = entity.state !== "unavailable";
    if (reachable !== this.state.reachable) {
      this.state.reachable = reachable;
    }
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
      .substring(0, 4);
    return value.substring(0, maxLength - 4) + hash;
  }
}
