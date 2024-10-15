import { HomeAssistantFilter } from "./home-assistant-filter.js";

export interface CreateBridgeRequest {
  readonly name: string;
  readonly port?: number;
  readonly filter: HomeAssistantFilter;
}

export interface UpdateBridgeRequest extends CreateBridgeRequest {
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

export interface BridgeData {
  readonly id: string;
  readonly name: string;
  readonly port: number;
  readonly filter: HomeAssistantFilter;
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
