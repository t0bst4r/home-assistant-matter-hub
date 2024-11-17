import { HomeAssistantFilter } from "./home-assistant-filter.js";
import { HomeAssistantDomain } from "./home-assistant-domain.js";
import { CompatibilityMode } from "./compatibility-mode.js";

export type BridgeDomainOverrides = Partial<
  Record<HomeAssistantDomain, object>
>;
export type BridgeEntityOverrides = Partial<Record<string, object>>;

export interface BridgeOverrides {
  readonly domains: BridgeDomainOverrides;
  readonly entities: BridgeEntityOverrides;
}

export interface BridgeConfig {
  readonly name: string;
  readonly port: number;
  readonly compatibility?: CompatibilityMode;
  readonly filter: HomeAssistantFilter;
  readonly overrides?: BridgeOverrides;
}

export interface CreateBridgeRequest extends BridgeConfig {}

export interface UpdateBridgeRequest extends BridgeConfig {
  readonly id: string;
}

export interface BridgeBasicInformation {
  vendorId: number;
  vendorName: string;
  productId: number;
  productName: string;
  productLabel: string;
  hardwareVersion: number;
  softwareVersion: number;
}

export interface BridgeData extends BridgeConfig {
  readonly id: string;
  readonly basicInformation: BridgeBasicInformation;
  readonly commissioning?: BridgeCommissioning;
  readonly deviceCount: number;
}

export interface BridgeCommissioning {
  readonly isCommissioned: boolean;
  readonly passcode: number;
  readonly discriminator: number;
  readonly manualPairingCode: string;
  readonly qrPairingCode: string;
  readonly fabrics: BridgeFabric[];
}

export interface BridgeFabric {
  readonly fabricIndex: number;
  readonly fabricId: number;
  readonly nodeId: number;
  readonly rootNodeId: number;
  readonly rootVendorId: number;
  readonly label: string;
}
