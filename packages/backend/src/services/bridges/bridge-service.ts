import crypto from "node:crypto";
import type {
  BridgeBasicInformation,
  BridgeData,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { Service } from "../../core/ioc/service.js";
import type { BridgeStorage } from "../storage/bridge-storage.js";
import type { Bridge } from "./bridge.js";
import type { BridgeFactory } from "./bridge-factory.js";

export interface BridgeServiceProps {
  basicInformation: BridgeBasicInformation;
}

export class BridgeService extends Service {
  public readonly bridges: Bridge[] = [];

  constructor(
    private readonly bridgeStorage: BridgeStorage,
    private readonly bridgeFactory: BridgeFactory,
    private readonly props: BridgeServiceProps,
  ) {
    super("BridgeService");
  }

  protected override async initialize() {
    for (const data of this.bridgeStorage.bridges) {
      await this.addBridge(data);
    }
  }
  override async dispose(): Promise<void> {
    await Promise.all(this.bridges.map((bridge) => bridge.dispose()));
  }

  async startAll() {
    for (const bridge of this.bridges) {
      await bridge.start();
    }
  }

  async refreshAll() {
    for (const bridge of this.bridges) {
      await bridge.refreshDevices();
    }
  }

  get(id: string): Bridge | undefined {
    return this.bridges.find((bridge) => bridge.id === id);
  }

  async create(request: CreateBridgeRequest): Promise<Bridge> {
    if (this.portUsed(request.port)) {
      throw new Error(`Port already in use: ${request.port}`);
    }
    const bridge = await this.addBridge({
      ...request,
      id: crypto.randomUUID().replace(/-/g, ""),
      basicInformation: this.props.basicInformation,
    });
    await this.bridgeStorage.add(bridge.data);
    await bridge.start();
    return bridge;
  }

  async update(request: UpdateBridgeRequest): Promise<Bridge | undefined> {
    if (this.portUsed(request.port, [request.id])) {
      throw new Error(`Port already in use: ${request.port}`);
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
    await bridge.stop();
    await bridge.delete();
    await bridge.dispose();
    this.bridges.splice(this.bridges.indexOf(bridge), 1);
    await this.bridgeStorage.remove(bridgeId);
  }

  private async addBridge(bridgeData: BridgeData): Promise<Bridge> {
    const bridge = await this.bridgeFactory.create(bridgeData);
    this.bridges.push(bridge);
    return bridge;
  }

  private portUsed(port: number, notId?: string[]): boolean {
    return this.bridges
      .filter((bridge) => notId == null || !notId.includes(bridge.id))
      .some((bridge) => bridge.data.port === port);
  }
}
