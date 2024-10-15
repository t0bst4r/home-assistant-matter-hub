import {
  BridgeBasicInformation,
  BridgeData,
  HomeAssistantEntityState,
  HomeAssistantFilter,
} from "@home-assistant-matter-hub/common";
import { ServerNode } from "@project-chip/matter.js/node";
import { AggregatorEndpoint } from "@project-chip/matter.js/endpoints/AggregatorEndpoint";
import { Environment } from "@project-chip/matter.js/environment";
import { Logger } from "winston";
import { detach } from "../utils/detach.js";
import { MatterDevice } from "./matter-device.js";
import { ServiceBase } from "../utils/service.js";
import { bridgeFromJson } from "../utils/json/bridge-from-json.js";
import { HomeAssistantClient } from "../home-assistant/home-assistant-client.js";
import _, { Dictionary } from "lodash";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { createDevice } from "./create-device.js";

export interface BridgeProps {
  readonly logger: Logger;
  readonly environment: Environment;
  readonly homeAssistant: HomeAssistantClient;
  readonly data: BridgeData;
}

export class Bridge extends ServiceBase {
  private readonly homeAssistant: HomeAssistantClient;
  private readonly environment: Environment;
  private server?: ServerNode;
  private unsubscribeEntities?: () => void;

  private initialData: BridgeData;
  private data: Omit<BridgeData, "commissioning" | "deviceCount">;
  private matterDevices: Record<string, MatterDevice | undefined> = {};

  get id(): string {
    return this.data.id;
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

  get basicInformation(): BridgeBasicInformation {
    return this.data.basicInformation;
  }

  get commissioning() {
    return this.server?.state.commissioning;
  }

  get devices(): MatterDevice[] {
    return _.values(this.matterDevices).filter(
      (it): it is MatterDevice => it != null,
    );
  }

  constructor(props: BridgeProps) {
    super(props.data.id, props.logger);
    this.environment = props.environment;
    this.homeAssistant = props.homeAssistant;
    this.initialData = this.data = props.data;
  }

  async start() {
    await this.close();

    const server = await ServerNode.create(
      bridgeFromJson(this.environment, this.initialData),
    );
    const aggregator = new Endpoint(AggregatorEndpoint, { id: "aggregator" });
    await server.add(aggregator);
    await detach(() => server.start());
    this.server = server;

    await this.createDevices(aggregator);

    this.unsubscribeEntities = this.homeAssistant.states(
      this.filter,
      this.updateDevices.bind(this),
    );
  }

  private async createDevices(aggregator: Endpoint) {
    for (const entity of this.homeAssistant.registry(this.filter)) {
      const device = createDevice(
        this.basicInformation,
        entity,
        this.log,
        this.homeAssistant,
      );
      if (device) {
        await aggregator.add(device);
        this.matterDevices[entity.entity_id] = device;
      }
    }
  }

  private async updateDevices(states: Dictionary<HomeAssistantEntityState>) {
    const entities = _.values(states);
    for (const entity of entities) {
      const device = this.matterDevices[entity.entity_id];
      await device?.update(entity);
    }
  }

  public async close() {
    this.unsubscribeEntities?.();
    this.unsubscribeEntities = undefined;
    if (this.server) {
      await this.server.close();
      this.server = undefined;
    }

    this.matterDevices = {};
  }
}
