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

    const bridgeIds: string[] = await this.storage.get("ids", []);
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
    const version = await this.storage.get<number>("version", 1);
    let migratedVersion: number = version;
    if (version === 1) {
      migratedVersion = await this.migrateV1ToV2();
    }
    if (version === 2) {
      migratedVersion = await this.migrateV2ToV3();
    }
    if (migratedVersion !== version) {
      await this.storage.set("version", migratedVersion);
      return this.migrate();
    }
  }

  private async migrateV1ToV2() {
    const bridgeIds = JSON.parse(
      await this.storage.get("ids", "[]"),
    ) as string[];
    await this.storage.set("ids", bridgeIds);

    for (const bridgeId of bridgeIds) {
      const bridgeValue = await this.storage.get<string | undefined>(bridgeId);
      if (bridgeValue == undefined) {
        continue;
      }
      const bridge = JSON.parse(bridgeValue);
      delete bridge["compatibility"];
      await this.storage.set(bridgeId, bridge);
    }
    return 2;
  }

  private async migrateV2ToV3() {
    const bridgeIdsValue = await this.storage.get<string | string[]>("ids", []);
    let bridgeIds: string[];
    if (typeof bridgeIdsValue === "string") {
      bridgeIds = JSON.parse(bridgeIdsValue);
      await this.storage.set("ids", bridgeIds);
    } else {
      bridgeIds = bridgeIdsValue;
    }

    for (const bridgeId of bridgeIds) {
      const bridgeValue = await this.storage.get<string | {} | undefined>(
        bridgeId,
      );
      if (bridgeValue == undefined) {
        continue;
      }
      let bridge: {};
      if (typeof bridgeValue === "string") {
        bridge = JSON.parse(bridgeValue);
      } else {
        bridge = bridgeValue;
      }
      await this.storage.set(bridgeId, bridge);
    }
    return 3;
  }
}
