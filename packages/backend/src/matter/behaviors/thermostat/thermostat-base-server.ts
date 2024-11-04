import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
  Type,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer as Base } from "@project-chip/matter.js/behaviors/thermostat";
import { Thermostat } from "@project-chip/matter.js/cluster";
import { Behavior } from "@project-chip/matter.js/behavior";
import _ from "lodash";
import { HomeAssistantBehavior } from "../../custom-behaviors/home-assistant-behavior.js";

export function ThermostatBaseServer<T extends Type<Base>>(type: T) {
  return class ThermostatBaseServer extends type {
    protected declare internal: ThermostatBaseServer.Internal;

    override async initialize() {
      await super.initialize();
      const homeAssistant = await this.agent.load(HomeAssistantBehavior);
      Object.assign(
        this.internal,
        this.getState(
          homeAssistant.state
            .entity as HomeAssistantEntityState<ClimateDeviceAttributes>,
        ),
      );
      this.endpoint
        .eventsOf(Base)
        .systemMode$Changed.on(this.systemModeChanged.bind(this));
      homeAssistant.onUpdate((s) => this.update(s));
    }

    protected async update(state: HomeAssistantEntityState) {
      Object.assign(
        this.internal,
        this.getState(
          state as HomeAssistantEntityState<ClimateDeviceAttributes>,
        ),
      );
      const actualState = this.endpoint.stateOf(Base);
      const actualLocalTemperature = actualState.localTemperature;
      const actualSystemMode = actualState.systemMode;

      const patch: Behavior.PatchStateOf<typeof Base> = {};

      if (
        this.internal.currentTemperature != null &&
        this.internal.currentTemperature !== actualLocalTemperature
      ) {
        patch.localTemperature = this.internal.currentTemperature;
      }
      if (actualSystemMode !== this.internal.systemMode) {
        patch.systemMode = this.internal.systemMode;
      }

      if (_.size(patch) > 0) {
        await this.endpoint.setStateOf(Base, patch);
      }
    }

    override async setpointRaiseLower(
      request: Thermostat.SetpointRaiseLowerRequest,
    ) {
      const homeAssistant = this.agent.get(HomeAssistantBehavior);
      const targetTemperature = this.internal?.targetTemperature;
      if (targetTemperature == null) {
        return;
      }
      await super.setpointRaiseLower(request);
      const newTargetTemperature =
        targetTemperature / 100 + request.amount / 10;
      await homeAssistant.callAction(
        "climate",
        "set_temperature",
        { temperature: newTargetTemperature },
        { entity_id: homeAssistant.state.entity.entity_id },
      );
    }

    protected async targetTemperatureChanged(value: number) {
      const homeAssistant = this.agent.get(HomeAssistantBehavior);
      if (value === this.internal?.targetTemperature) {
        return;
      }
      await homeAssistant.callAction(
        "climate",
        "set_temperature",
        { temperature: value / 100 },
        { entity_id: homeAssistant.state.entity.entity_id },
      );
    }

    private async systemModeChanged(systemMode: Thermostat.SystemMode) {
      const homeAssistant = this.agent.get(HomeAssistantBehavior);
      if (systemMode === this.internal?.systemMode) {
        return;
      }
      await homeAssistant.callAction(
        "climate",
        "set_hvac_mode",
        { hvac_mode: this.getHvacMode(systemMode) },
        { entity_id: homeAssistant.state.entity.entity_id },
      );
    }

    private getState(
      entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
    ): ThermostatBaseServer.Internal {
      return {
        systemMode: this.getSystemMode(entity.state),
        minTemperature:
          this.getTemperature(entity.attributes.min_temp) ?? undefined,
        maxTemperature:
          this.getTemperature(entity.attributes.max_temp) ?? undefined,
        currentTemperature: this.getTemperature(
          entity.attributes.current_temperature,
        ),
        targetTemperature:
          this.getTemperature(entity.attributes.temperature) ?? 2100,
      };
    }

    private getSystemMode(state: string | undefined): Thermostat.SystemMode {
      switch (state ?? "off") {
        case "heat":
          return Thermostat.SystemMode.Heat;
        case "cool":
          return Thermostat.SystemMode.Cool;
      }
      return Thermostat.SystemMode.Off;
    }

    private getHvacMode(systemMode: Thermostat.SystemMode): ClimateHvacMode {
      switch (systemMode) {
        case Thermostat.SystemMode.Cool:
          return ClimateHvacMode.cool;
        case Thermostat.SystemMode.Heat:
          return ClimateHvacMode.heat;
        default:
          return ClimateHvacMode.off;
      }
    }

    private getTemperature(
      value: number | string | null | undefined,
    ): number | null {
      const current = value != null ? +value : null;
      if (current == null || isNaN(current)) {
        return null;
      } else {
        return current * 100;
      }
    }
  };
}

export namespace ThermostatBaseServer {
  export class Internal {
    systemMode!: Thermostat.SystemMode;
    minTemperature!: number | undefined;
    maxTemperature!: number | undefined;
    targetTemperature!: number;
    currentTemperature!: number | null;
  }
}
