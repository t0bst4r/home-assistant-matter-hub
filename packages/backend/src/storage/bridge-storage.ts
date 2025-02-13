import { BridgeData } from "@home-assistant-matter-hub/common";
import {
  Environment,
  Environmental,
  StorageContext,
  SupportedStorageTypes,
} from "@matter/main";
import { AppStorage } from "./app-storage.js";
import { register, Service } from "../environment/register.js";
import _ from "lodash";

type StorageObjectType = { [key: string]: SupportedStorageTypes };

export class BridgeStorage implements Service {
  static [Environmental.create](environment: Environment) {
    return new this(environment);
  }

  readonly construction: Promise<void>;
  private storage!: StorageContext;
  private _bridges: BridgeData[] = [];

  constructor(private readonly environment: Environment) {
    register(environment, BridgeStorage, this);
    this.construction = this.initialize();
  }

  private async initialize() {
    const appStorage = await this.environment.load(AppStorage);
    this.storage = appStorage.createContext("bridges");

    await this.migrate();

    let bridgeIds: string[] = await this.storage.get("ids", []);
    const bridges = await Promise.all(
      bridgeIds.map(async (bridgeId) =>
        this.storage.get<StorageObjectType | undefined>(bridgeId),
      ),
    );
    this._bridges = bridges
      .filter((b) => b != undefined)
      .map((bridge) => bridge as unknown as BridgeData);
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
    await this.storage.set(bridge.id, bridge as unknown as StorageObjectType);
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
      this._bridges.map((b) => b.id),
    );
  }

  private async migrate(): Promise<void> {
    let version = await this.storage.get<number>("version", 1);
    if (version === 1) {
      await this.migrateV1ToV2();
      return this.migrate();
    }
  }

  private async migrateV1ToV2() {
    const bridgeIds = JSON.parse(
      await this.storage.get("ids", "[]"),
    ) as string[];
    await this.storage.set("ids", bridgeIds);

    const bridgeStrings = await Promise.all(
      bridgeIds.map(async (bridgeId) =>
        this.storage.get<string | undefined>(bridgeId),
      ),
    );
    const bridges = bridgeStrings
      .filter((b): b is string => b != undefined)
      .map((bridge) => {
        const b = JSON.parse(bridge);
        delete b["compatibility"];
        return b as { id: string } & StorageObjectType;
      });
    await Promise.all(
      bridges.map((bridge) => this.storage.set(bridge.id, bridge)),
    );
    await this.storage.set("version", 2);
  }
}
