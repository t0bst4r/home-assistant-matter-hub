import { BridgedDeviceBasicInformationServer as Base } from "@matter/main/behaviors";
import crypto from "node:crypto";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { BridgeDataProvider } from "../bridge/bridge-data-provider.js";
import { VendorId } from "@matter/main";

export class BasicInformationServer extends Base {
  override async initialize(): Promise<void> {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const { basicInformation } = this.env.get(BridgeDataProvider);
    const device = entity.deviceRegistry;
    applyPatchState(this.state, {
      // The correct vendor name is in `device?.manufacturer`, but most
      // controllers are currently unable to show this for bridged devices, and
      // as Alexa Media Player relies on a check for a t0bst4r vendor to avoid
      // loops, we keep it like this for now.
      // See: https://github.com/alandtse/alexa_media_player/pull/2730
      vendorId: VendorId(basicInformation.vendorId),
      vendorName: hash(32, basicInformation.vendorName),
      productName:
        ellipse(32, device?.model_id) ??
        ellipse(32, device?.model) ??
        hash(32, basicInformation.productName),
      productLabel:
        ellipse(64, device?.model) ?? hash(64, basicInformation.productLabel),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      hardwareVersionString: ellipse(64, device?.hw_version),
      softwareVersionString: ellipse(64, device?.sw_version),
      nodeLabel:
        ellipse(32, entity.state.attributes.friendly_name) ??
        ellipse(32, entity.entity_id),
      reachable: entity.state.state !== "unavailable",
      // The device serial number is available in `device?.serial_number`, but
      // we're keeping it as the entity ID for now to avoid breaking existing
      // deployments.
      serialNumber: hash(32, entity.entity_id),
    });
  }
}

function ellipse(maxLength: number, value?: string) {
  return trimToLength(value, maxLength, "ellipsis");
}

function hash(maxLength: number, value?: string) {
  return trimToLength(value, maxLength, "hash");
}

function trimToLength(
  value: string | null | undefined,
  maxLength: number,
  type: "ellipsis" | "hash",
): string | undefined {
  if (!value?.toString().trim().length) {
    return undefined;
  }
  if (value.length <= maxLength) {
    return value;
  } else {
    const suffix = createSuffix(value, type);
    return value.substring(0, maxLength - suffix.length) + suffix;
  }
}

function createSuffix(value: string, type: "ellipsis" | "hash") {
  if (type === "hash") {
    const hashLength = 4;
    return crypto
      .createHash("md5")
      .update(value)
      .digest("hex")
      .substring(0, hashLength);
  } else {
    return "...";
  }
}
