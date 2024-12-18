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
    applyPatchState(this.state, {
      vendorId: VendorId(basicInformation.vendorId),
      vendorName: maxLengthOrHash(basicInformation.vendorName, 32),
      productName: maxLengthOrHash(basicInformation.productName, 32),
      productLabel: maxLengthOrHash(basicInformation.productLabel, 64),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      nodeLabel: maxLengthOrHash(
        entity.state.attributes.friendly_name ?? entity.entity_id,
        32,
      ),
      reachable: entity.state.state !== "unavailable",
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
