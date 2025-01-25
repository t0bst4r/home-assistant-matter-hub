import crypto from "node:crypto";
import {
  BridgeBasicInformation,
  BridgeData,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { PortAlreadyInUseError } from "../errors/port-already-in-use-error.js";
import { asyncNew, Environment } from "@matter/main";
import { BridgeStorage } from "../storage/bridge-storage.js";
import { BridgeServerNode } from "./bridge/bridge-server-node.js";
import { register, Service } from "../environment/register.js";

export class BridgeService implements Service {
  readonly construction: Promise<void>;
  public readonly bridges: BridgeServerNode[] = [];
  private bridgeStorage!: BridgeStorage;

  constructor(
    private readonly environment: Environment,
    private readonly basicInformation: BridgeBasicInformation,
  ) {
    register(environment, BridgeService, this);
    this.construction = this.initialize();
  }

  private async initialize() {
    this.bridgeStorage = await this.environment.load(BridgeStorage);
    for (const data of this.bridgeStorage.bridges) {
      const bridge = await this.addBridge(data);
      await bridge.start();
    }
  }

  async [Symbol.asyncDispose]() {
    await Promise.all(this.bridges.map((bridge) => bridge.close()));
  }

  get(id: string): BridgeServerNode | undefined {
    return this.bridges.find((bridge) => bridge.id === id);
  }

  async create(request: CreateBridgeRequest): Promise<BridgeServerNode> {
    if (this.portUsed(request.port)) {
      throw new PortAlreadyInUseError(request.port);
    }
    const bridge = await this.addBridge({
      ...request,
      id: crypto.randomUUID().replace(/-/g, ""),
      basicInformation: this.basicInformation,
    });
    await this.bridgeStorage.add(bridge.data);
    await bridge.start();
    return bridge;
  }

  async update(
    request: UpdateBridgeRequest,
  ): Promise<BridgeServerNode | undefined> {
    if (this.portUsed(request.port, [request.id])) {
      throw new PortAlreadyInUseError(request.port);
    }
    const bridge = this.get(request.id);
    if (!bridge) {
      return;
    }
    await bridge.update(request);
    await this.bridgeStorage.add(bridge.data);
    return bridge;
  }

  async delete(bridgeId: string): Promise<void> {
    const bridge = this.bridges.find((bridge) => bridge.id === bridgeId);
    if (!bridge) {
      return;
    }
    await bridge.delete();
    this.bridges.splice(this.bridges.indexOf(bridge), 1);
    await this.bridgeStorage.remove(bridgeId);
  }

  private async addBridge(bridgeData: BridgeData): Promise<BridgeServerNode> {
    const bridge = await asyncNew(
      BridgeServerNode,
      this.environment,
      bridgeData,
    );
    this.bridges.push(bridge);
    return bridge;
  }

  private portUsed(port: number, notId?: string[]): boolean {
    return this.bridges
      .filter((bridge) => notId == null || !notId.includes(bridge.id))
      .some((bridge) => bridge.data.port === port);
  }
}
