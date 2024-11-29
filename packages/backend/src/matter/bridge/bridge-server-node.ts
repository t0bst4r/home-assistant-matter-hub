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
import { Logger } from "winston";
import { createLogger } from "../../logging/create-logger.js";

export type BridgeServerNodeConfig =
  Node.Configuration<ServerNode.RootEndpoint>;

export class BridgeServerNode {
  static async create(environment: Environment, bridgeData: BridgeData) {
    const node = new BridgeServerNode(environment, bridgeData);
    await node.initialize();
    return node;
  }

  private readonly log: Logger;
  private serverNode!: ServerNode;
  private aggregator!: Endpoint;
  private deviceManager!: BridgeDeviceManager;

  private status: BridgeStatus = BridgeStatus.Stopped;
  private statusReason?: string = "Bridge is not yet started";

  get id() {
    return this.bridgeData.id;
  }

  get data(): BridgeDataWithMetadata {
    const bridgeData = this.bridgeData;
    const commissioning = this.serverNode.state.commissioning;
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

  get parts() {
    return this.aggregator.parts;
  }

  private constructor(
    private readonly environment: Environment,
    private bridgeData: BridgeData,
  ) {
    this.log = createLogger(`Bridge / ${bridgeData.id}`);
  }

  private async initialize() {
    this.serverNode = await ServerNode.create(
      createBridgeServerConfig(this.environment, this.bridgeData),
    );
    this.aggregator = new Endpoint(AggregatorEndpoint, { id: "aggregator" });
    await this.serverNode.add(this.aggregator);
    this.deviceManager = new BridgeDeviceManager(
      this.environment,
      this.aggregator,
    );
  }

  async start() {
    if (this.status === BridgeStatus.Running) {
      return;
    }
    try {
      await this.deviceManager.loadDevices(this.bridgeData);
      await this.serverNode.start();
      this.status = BridgeStatus.Running;
      this.statusReason = undefined;
    } catch (e) {
      this.log.error("Failed to start bridge due to error: %s", e);
      await this.serverNode.cancel();
      this.statusReason = `Failed to start bridge due to error:\n${e?.toString()}`;
      this.status = BridgeStatus.Failed;
    }
  }

  async stop() {
    if (this.status !== BridgeStatus.Running) {
      return;
    }
    await this.serverNode.cancel();
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
      this.log.error("Failed to update bridge due to error: %s", e);
      await this.serverNode.cancel();
      this.statusReason = `Failed to start bridge due to error:\n${e?.toString()}`;
      this.status = BridgeStatus.Failed;
    }
  }

  async factoryReset() {
    if (this.status !== BridgeStatus.Running) {
      return;
    }
    await this.serverNode.cancel();
    await this.serverNode.reset();
    await this.serverNode.erase();
    await this.start();
  }

  async delete() {
    await this.stop();
    await this.serverNode.delete();
  }
}
