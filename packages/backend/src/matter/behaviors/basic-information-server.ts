import { BridgedDeviceBasicInformationServer as Base } from "@matter/main/behaviors";
import crypto from "node:crypto";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { BridgeDataProvider } from "../bridge/bridge-data-provider.js";
import { VendorId } from "@matter/main";

const ellipsize = (
  str: string | undefined,
  len: number,
): string | undefined => {
  if (!str || str.length <= len) {
    return str;
  }
  return str.slice(0, len - 3) + "...";
};

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
      vendorName: maxLengthOrHash(basicInformation.vendorName, 32),
      productName:
        (device?.model_id
          ? ellipsize(device?.model_id, 32)
          : ellipsize(device?.model, 32)) ??
        maxLengthOrHash(basicInformation.productName, 32),
      productLabel:
        ellipsize(device?.model, 64) ??
        maxLengthOrHash(basicInformation.productLabel, 64),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      hardwareVersionString: ellipsize(device?.hw_version, 64) ?? undefined,
      softwareVersionString: ellipsize(device?.sw_version, 64) ?? undefined,
      nodeLabel: ellipsize(
        entity.state.attributes.friendly_name ?? entity.entity_id,
        32,
      ),
      reachable: entity.state.state !== "unavailable",

      // The device serial number is available in `device?.serial_number`, but
      // we're keeping it as the entity ID for now to avoid breaking existing
      // deployments.
      serialNumber: maxLengthOrHash(entity.entity_id, 32),
    });
  }
}

function maxLengthOrHash(
  value: string | undefined,
  maxLength: number,
): string | undefined {
  if (value == undefined) {
    return undefined;
  }
  const hashLength = 4;
  if (maxLength < 16) {
    throw new Error("MaxLength cannot be shorter than 16");
  }
  if (value.length <= maxLength) {
    return value;
  } else {
    const hash = crypto
      .createHash("md5")
      .update(value)
      .digest("hex")
      .substring(0, hashLength);
    return value.substring(0, maxLength - hashLength) + hash;
  }
}
