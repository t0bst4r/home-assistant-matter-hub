import {
  type CoverDeviceAttributes,
  CoverSupportedFeatures,
} from "@home-assistant-matter-hub/common";
import type {
  CoverMappingOptions,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { WindowCovering } from "@matter/main/clusters";
import { WindowCoveringDevice } from "@matter/main/devices";
import type { FeatureSelection } from "../../../../utils/feature-selection.js";
import { testBit } from "../../../../utils/test-bit.js";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { BridgeDataProvider } from "../../../../services/bridges/bridge-data-provider.js";
import { CoverWindowCoveringServer } from "./behaviors/cover-window-covering-server.js";

const CoverDeviceType = (supportedFeatures: number) => {
  const features: FeatureSelection<WindowCovering.Complete> = new Set();
  if (testBit(supportedFeatures, CoverSupportedFeatures.support_open)) {
    features.add("Lift");
    features.add("PositionAwareLift");
    if (
      testBit(supportedFeatures, CoverSupportedFeatures.support_set_position)
    ) {
      features.add("AbsolutePosition");
    }
  }

  if (testBit(supportedFeatures, CoverSupportedFeatures.support_open_tilt)) {
    features.add("Tilt");
    features.add("PositionAwareTilt");
    if (
      testBit(
        supportedFeatures,
        CoverSupportedFeatures.support_set_tilt_position,
      )
    ) {
      features.add("AbsolutePosition");
    }
  }

  return WindowCoveringDevice.with(
    BasicInformationServer,
    IdentifyServer,
    HomeAssistantEntityBehavior,
    CoverWindowCoveringServer.with(...features),
  );
};

export function CoverDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType {
  const attributes = homeAssistantEntity.entity.state
    .attributes as CoverDeviceAttributes;
  return CoverDeviceType(attributes.supported_features ?? 0).set({
    homeAssistantEntity,
  });
}

export function getCoverMappingOptions(
  entity: HomeAssistantEntityInformation,
  bridgeDataProvider: BridgeDataProvider,
): CoverMappingOptions {
  const entityId = entity.entity_id;
  const deviceClass = entity.state.attributes.device_class;
  const featureFlags = bridgeDataProvider.featureFlags;
  const override = bridgeDataProvider.getCoverOverride(entityId);

  const inferredType: CoverMappingOptions["inferredType"] =
    deviceClass === "garage" ? "garage" : "standard";

  const globalInvert =
    featureFlags?.coverDoNotInvertPercentage === true ? false : true;

  let invertPercentage: boolean;

  if (inferredType === "garage") {
    // Garage-specific behavior:
    // Base: no inversion, to avoid double-inversion of the 0/100 fallback mapping.
    const base = false;
    if (override?.invertDirection === true) {
      invertPercentage = !base;
    } else if (override?.invertDirection === false) {
      invertPercentage = base;
    } else {
      invertPercentage = base;
    }
  } else {
    // Non-garage: preserve previous behavior based on globalInvert and overrides.
    const base = globalInvert;
    if (override?.invertDirection === true) {
      invertPercentage = !base;
    } else if (override?.invertDirection === false) {
      invertPercentage = base;
    } else {
      invertPercentage = base;
    }
  }

  const swapOpenClose = false;

  return {
    entityId,
    deviceClass,
    inferredType,
    invertPercentage,
    swapOpenClose,
  };
}
