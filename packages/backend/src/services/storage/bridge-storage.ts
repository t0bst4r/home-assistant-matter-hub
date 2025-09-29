import type { BridgeData } from "@home-assistant-matter-hub/common";
import type { StorageContext, SupportedStorageTypes } from "@matter/main";
import { Service } from "../../core/ioc/service.js";
import type { AppStorage } from "./app-storage.js";
import { migrateBridgeV1ToV2 } from "./migrations/bridge/v1-to-v2.js";
import { migrateBridgeV2ToV3 } from "./migrations/bridge/v2-to-v3.js";
import { migrateBridgeV3ToV4 } from "./migrations/bridge/v3-to-v4.js";
import { migrateBridgeV4ToV5 } from "./migrations/bridge/v4-to-v5.js";

type StorageObjectType = { [key: string]: SupportedStorageTypes };

export class BridgeStorage extends Service {
  private storage!: StorageContext;
  private _bridges: BridgeData[] = [];

  constructor(private readonly appStorage: AppStorage) {
    super("BridgeStorage");
  }

  protected override async initialize() {
    this.storage = this.appStorage.createContext("bridges");

    await this.migrate();

    const bridgeIds: string[] = await this.storage.get("ids", []);
    const bridges = await Promise.all(
      bridgeIds.map(async (bridgeId) =>
        this.storage.get<StorageObjectType | undefined>(bridgeId),
      ),
    );
    this._bridges = bridges
      .filter((b) => b !== undefined)
      .map((bridge) => bridge as unknown as BridgeData);
  }

  get bridges(): ReadonlyArray<BridgeData> {
    return this._bridges;
  }

  async add(bridge: BridgeData): Promise<void> {
    const idx = this._bridges.findIndex((b) => b.id === bridge.id);
    if (idx !== -1) {
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
      migratedVersion = await migrateBridgeV1ToV2(this.storage);
    } else if (version === 2) {
      migratedVersion = await migrateBridgeV2ToV3(this.storage);
    } else if (version === 3) {
      migratedVersion = await migrateBridgeV3ToV4(this.storage);
    } else if (version === 4) {
      migratedVersion = await migrateBridgeV4ToV5(this.storage);
    }
    if (migratedVersion !== version) {
      await this.storage.set("version", migratedVersion);
      return this.migrate();
    }
  }
}
