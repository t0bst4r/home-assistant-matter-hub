import type { HomeAssistantFilter } from "./home-assistant-filter.js";

interface AllBridgeFeatureFlags {
  readonly coverDoNotInvertPercentage: boolean;
  readonly includeHiddenEntities: boolean;
}

export type BridgeFeatureFlags = Partial<AllBridgeFeatureFlags>;

export interface BridgeConfig {
  readonly name: string;
  readonly port: number;
  readonly filter: HomeAssistantFilter;
  readonly featureFlags?: BridgeFeatureFlags;
  readonly countryCode?: string;
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
}

export interface BridgeDataWithMetadata extends BridgeData {
  readonly status: BridgeStatus;
  readonly statusReason?: string;
  readonly commissioning?: BridgeCommissioning | null;
  readonly deviceCount: number;
}

export enum BridgeStatus {
  Starting = "starting",
  Running = "running",
  Stopped = "stopped",
  Failed = "failed",
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
