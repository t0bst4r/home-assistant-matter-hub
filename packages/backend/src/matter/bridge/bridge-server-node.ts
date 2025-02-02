import { Node, ServerNode } from "@matter/main/node";
import { Endpoint, Environment } from "@matter/main";
import {
  BridgeData,
  BridgeDataWithMetadata,
  BridgeStatus,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { createBridgeServerConfig } from "../../utils/json/create-bridge-server-config.js";
import { AggregatorEndpoint } from "@matter/main/endpoints";
import { BridgeDeviceManager } from "./bridge-device-manager.js";
import _ from "lodash";
import { Logger } from "@matter/general";
import { BridgeDataProvider } from "./bridge-data-provider.js";
import { LoggerService } from "../../environment/logger.js";

export type BridgeServerNodeConfig =
  Node.Configuration<ServerNode.RootEndpoint>;

export class BridgeServerNode extends ServerNode {
  private readonly log: Logger;
  private readonly aggregator: Endpoint;
  private readonly deviceManager: BridgeDeviceManager;

  private status: BridgeStatus = BridgeStatus.Stopped;
  private statusReason?: string = "Bridge is not yet started";

  get data(): BridgeDataWithMetadata {
    const bridgeData = this.bridgeData;
    const commissioning = this.state.commissioning;
    return {
      ...bridgeData,
      status: this.status,
      statusReason: this.statusReason,
      commissioning: commissioning
        ? {
            isCommissioned: commissioning.commissioned,
            passcode: commissioning.passcode,
            discriminator: commissioning.discriminator,
            manualPairingCode: commissioning.pairingCodes.manualPairingCode,
            qrPairingCode: commissioning.pairingCodes.qrPairingCode,
            fabrics: _.values(commissioning.fabrics).map((fabric) => ({
              fabricIndex: fabric.fabricIndex,
              fabricId: Number(fabric.fabricId),
              nodeId: Number(fabric.nodeId),
              rootNodeId: Number(fabric.rootNodeId),
              rootVendorId: fabric.rootVendorId,
              label: fabric.label,
            })),
          }
        : undefined,
      deviceCount: this.aggregator.parts.size,
    };
  }

  get aggregatedParts() {
    return this.aggregator.parts;
  }

  constructor(
    env: Environment,
    private bridgeData: BridgeData,
  ) {
    const environment = new Environment(bridgeData.id, env);
    const aggregator = new Endpoint(AggregatorEndpoint, { id: "aggregator" });
    const config = createBridgeServerConfig(environment, bridgeData);
    super({
      ...config,
      parts: [...(config.parts ?? []), aggregator],
    });
    new BridgeDataProvider(this.env, bridgeData);
    this.log = environment.get(LoggerService).get(`Bridge / ${bridgeData.id}`);
    this.aggregator = aggregator;
    this.deviceManager = new BridgeDeviceManager(
      this.env,
      bridgeData.id,
      this.aggregator,
    );
  }

  override async start() {
    if (this.status === BridgeStatus.Running) {
      return;
    }
    try {
      await this.deviceManager.loadDevices(this.bridgeData);
      await super.start();
      this.status = BridgeStatus.Running;
      this.statusReason = undefined;
    } catch (e) {
      this.log.error("Failed to start bridge due to error:", e);
      await super.cancel();
      this.statusReason = `Failed to start bridge due to error:\n${e?.toString()}`;
      this.status = BridgeStatus.Failed;
    }
  }

  override async cancel() {
    if (this.status !== BridgeStatus.Running) {
      return;
    }
    await super.cancel();
    this.statusReason = "Manually stopped";
    this.status = BridgeStatus.Stopped;
  }

  async update(update: UpdateBridgeRequest) {
    if (this.bridgeData.id !== update.id) {
      throw new Error("Update request id does not match data id");
    }
    this.bridgeData = { ...this.bridgeData, ...update };
    try {
      await this.deviceManager.loadDevices(this.bridgeData);
    } catch (e) {
      this.log.error("Failed to update bridge due to error:", e);
      await super.cancel();
      this.statusReason = `Failed to start bridge due to error:\n${e?.toString()}`;
      this.status = BridgeStatus.Failed;
    }
  }

  async factoryReset() {
    if (this.status !== BridgeStatus.Running) {
      return;
    }
    await this.cancel();
    await this.resetStorage();
    this.status = BridgeStatus.Stopped;
    await this.start();
  }
}
