import {
  HomeAssistantEntityRegistryWithInitialState,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import { EndpointType } from "@project-chip/matter.js/endpoint/type";
import { HomeAssistantActions } from "../home-assistant/home-assistant-actions.js";
import { Observable, Subject } from "rxjs";
import { Logger } from "winston";

export interface MatterDeviceProps<TDeviceConfig = unknown> {
  logger: Logger;
  actions: HomeAssistantActions;
  entity: HomeAssistantEntityRegistryWithInitialState;
  deviceConfig?: TDeviceConfig;
}

export class MatterDevice<
  T extends EndpointType = EndpointType.Empty,
> extends Endpoint<T> {
  private readonly state$ = new Subject<HomeAssistantEntityState>();
  get entityState(): Observable<HomeAssistantEntityState> {
    return this.state$.asObservable();
  }

  readonly logger: Logger;
  readonly actions: HomeAssistantActions;
  readonly entity: HomeAssistantEntityRegistryWithInitialState;

  constructor(type: T, options: Endpoint.Options<T>, props: MatterDeviceProps) {
    super(type, {
      id: props.entity.entity_id.replace(/\./g, "_"),
      ...options,
    });
    this.logger = props.logger;
    this.actions = props.actions;
    this.entity = props.entity;
  }

  async update(state: HomeAssistantEntityState) {
    this.state$.next(state);
  }
}
