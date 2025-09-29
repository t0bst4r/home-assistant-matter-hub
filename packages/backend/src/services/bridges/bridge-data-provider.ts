import type {
  BridgeBasicInformation,
  BridgeData,
  BridgeFeatureFlags,
  BridgeStatus,
  HomeAssistantFilter,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import type { ServerNode } from "@matter/main/node";
import { values } from "lodash-es";
import { Service } from "../../core/ioc/service.js";

export interface BridgeServerStatus {
  code: BridgeStatus;
  reason?: string;
}

export class BridgeDataProvider extends Service implements BridgeData {
  private readonly data: BridgeData;

  constructor(initial: BridgeData) {
    super("BridgeDataProvider");
    this.data = Object.assign({}, initial);
  }

  /************************************************
   * BridgeData interface
   ************************************************/
  get id(): string {
    return this.data.id;
  }
  get basicInformation(): BridgeBasicInformation {
    return this.data.basicInformation;
  }
  get name(): string {
    return this.data.name;
  }
  get port(): number {
    return this.data.port;
  }
  get filter(): HomeAssistantFilter {
    return this.data.filter;
  }
  get featureFlags(): BridgeFeatureFlags | undefined {
    return this.data.featureFlags;
  }
  get countryCode(): string | undefined {
    return this.data.countryCode;
  }

  /************************************************
   * Functions
   ************************************************/
  update(data: UpdateBridgeRequest) {
    if (this.id !== data.id) {
      throw new Error("ID of update request does not match bridge data id.");
    }
    Object.assign(this.data, data);
  }

  /**
   * @deprecated
   */
  withMetadata(
    status: BridgeServerStatus,
    serverNode: ServerNode,
    deviceCount: number,
  ) {
    const commissioning = serverNode.state.commissioning;
    return {
      id: this.id,
      name: this.name,
      filter: this.filter,
      port: this.port,
      featureFlags: this.featureFlags,
      basicInformation: this.basicInformation,
      countryCode: this.countryCode,
      status: status.code,
      statusReason: status.reason,
      commissioning: commissioning
        ? {
            isCommissioned: commissioning.commissioned,
            passcode: commissioning.passcode,
            discriminator: commissioning.discriminator,
            manualPairingCode: commissioning.pairingCodes.manualPairingCode,
            qrPairingCode: commissioning.pairingCodes.qrPairingCode,
            fabrics: values(commissioning.fabrics).map((fabric) => ({
              fabricIndex: fabric.fabricIndex,
              fabricId: Number(fabric.fabricId),
              nodeId: Number(fabric.nodeId),
              rootNodeId: Number(fabric.rootNodeId),
              rootVendorId: fabric.rootVendorId,
              label: fabric.label,
            })),
          }
        : undefined,
      deviceCount,
    };
  }
}
