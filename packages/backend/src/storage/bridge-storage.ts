import { BridgeData } from "@home-assistant-matter-hub/common";
import { Environment, Environmental, StorageContext } from "@matter/main";
import { AppStorage } from "./app-storage.js";
import { register, Service } from "../environment/register.js";

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

    const bridgeIds: string[] = JSON.parse(await this.storage.get("ids", "[]"));
    const bridges = await Promise.all(
      bridgeIds.map(async (bridgeId) =>
        this.storage.get<string | undefined>(bridgeId),
      ),
    );
    this._bridges = bridges
      .filter((b): b is string => b != undefined)
      .map((bridge) => {
        const b = JSON.parse(bridge);
        delete b["compatibility"];
        return b as BridgeData;
      });
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
