import crypto from "node:crypto";
import { Logger } from "winston";
import { Bridge } from "./bridge.js";
import {
  BridgeBasicInformation,
  BridgeData,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { PortAlreadyInUseError } from "../errors/port-already-in-use-error.js";
import { Environment } from "@project-chip/matter.js/environment";
import {
  StorageContext,
  StorageManager,
} from "@project-chip/matter.js/storage";
import { Service, ServiceBase } from "../utils/service.js";
import { bridgeToJson } from "../utils/json/bridge-to-json.js";
import { HomeAssistantClient } from "../home-assistant/home-assistant-client.js";

export interface BridgeServiceProps {
  readonly logger: Logger;
  readonly environment: Environment;
  readonly storage: StorageManager;
  readonly homeAssistant: HomeAssistantClient;
  readonly basicInformation: BridgeBasicInformation;
}

export class BridgeService extends ServiceBase {
  private readonly environment: Environment;
  private readonly storage: StorageManager;
  private readonly basicInformation: BridgeBasicInformation;
  private _bridgeStorage?: BridgeStorage;
  private readonly homeAssistant: HomeAssistantClient;

  get bridgeStorage(): BridgeStorage {
    if (!this._bridgeStorage) {
      throw new Error(
        "Cannot access bridge storage before BridgeService is initialized",
      );
    }
    return this._bridgeStorage;
  }

  public readonly bridges: Bridge[] = [];

  constructor(props: BridgeServiceProps) {
    super("Bridges", props.logger);
    this.environment = props.environment;
    this.storage = props.storage;
    this.basicInformation = props.basicInformation;

    this.homeAssistant = props.homeAssistant;
  }

  async start() {
    this._bridgeStorage = new BridgeStorage(
      this.storage.createContext("bridges"),
    );
    await this.bridgeStorage.start();
    for (const data of this.bridgeStorage.bridges) {
      const bridge = await this.addBridge(data);
      await bridge.start();
    }
  }

  async close() {
    await Promise.all(this.bridges.map((bridge) => bridge.close()));
  }

  get(id: string): Bridge | undefined {
    return this.bridges.find((bridge) => bridge.id === id);
  }

  async create(request: CreateBridgeRequest): Promise<Bridge> {
    if (this.portUsed(request.port)) {
      throw new PortAlreadyInUseError(request.port);
    }
    const bridge = await this.addBridge({
      id: crypto.randomUUID().replace(/-/g, ""),
      name: request.name,
      port: request.port,
      filter: request.filter,
      basicInformation: this.basicInformation,
      deviceCount: 0,
    });
    await this.bridgeStorage.add(bridgeToJson(bridge));
    await bridge.start();
    return bridge;
  }

  async update(request: UpdateBridgeRequest): Promise<Bridge | undefined> {
    if (this.portUsed(request.port, [request.id])) {
      throw new PortAlreadyInUseError(request.port);
    }
    const bridge = this.get(request.id);
    if (!bridge) {
      return;
    }
    await bridge.update(request);
    await this.bridgeStorage.add(bridgeToJson(bridge));
    await bridge.close();
    await bridge.start();
    return bridge;
  }

  async delete(bridgeId: string): Promise<void> {
    const bridge = this.bridges.find((bridge) => bridge.id === bridgeId);
    if (!bridge) {
      return;
    }
    await bridge.close();
    this.bridges.splice(this.bridges.indexOf(bridge), 1);
    await this.bridgeStorage.remove(bridgeId);
  }

  private async addBridge(bridgeData: BridgeData): Promise<Bridge> {
    const bridge = new Bridge({
      logger: this.log,
      environment: this.environment,
      homeAssistant: this.homeAssistant,
      data: bridgeData,
    });
    this.bridges.push(bridge);
    return bridge;
  }

  private portUsed(port: number, notId?: string[]): boolean {
    return this.bridges
      .filter((bridge) => notId == null || !notId.includes(bridge.id))
      .some((bridge) => bridge.port === port);
  }
}

class BridgeStorage implements Service {
  readonly serviceName = "BridgeStorage";

  private _bridges: BridgeData[] = [];

  constructor(private readonly storage: StorageContext) {}

  async start() {
    const bridgeIds: string[] = JSON.parse(await this.storage.get("ids", "[]"));
    const bridges = await Promise.all(
      bridgeIds.map(async (bridgeId) =>
        this.storage.get<string | undefined>(bridgeId),
      ),
    );
    this._bridges = bridges
      .filter((b): b is string => b != undefined)
      .map((bridge) => JSON.parse(bridge) as BridgeData);
  }

  get bridges(): ReadonlyArray<BridgeData> {
    return this._bridges;
  }

  async add(bridge: BridgeData): Promise<void> {
    const idx = this._bridges.findIndex((b) => b.id === bridge.id);
    if (idx != -1) {
      this._bridges[idx] = bridge;
    } else {
      this._bridges.push(bridge);
    }
    await this.storage.set(bridge.id, JSON.stringify(bridge));
    await this.persistIds();
  }

  async remove(bridgeId: string): Promise<void> {
    const idx = this._bridges.findIndex((b) => b.id === bridgeId);
    if (idx >= 0) {
      this._bridges.splice(idx, 1);
    }
    await this.storage.delete(bridgeId);
    await this.persistIds();
  }

  private async persistIds() {
    await this.storage.set(
      "ids",
      JSON.stringify(this._bridges.map((b) => b.id)),
    );
  }
}
