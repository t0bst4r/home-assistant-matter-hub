import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
  Type,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer as Base } from "@project-chip/matter.js/behavior/definitions/thermostat";
import { Thermostat } from "@project-chip/matter.js/cluster";
import { haMixin } from "../../mixins/ha-mixin.js";
import { Behavior } from "@project-chip/matter.js/behavior";
import _ from "lodash";

export interface ThermostatState {
  systemMode: Thermostat.SystemMode;
  minTemperature: number | undefined;
  maxTemperature: number | undefined;
  targetTemperature: number;
  currentTemperature: number | null;
}

function createBaseServer<T extends Type<Base>>(type: T) {
  return class ThermostatBaseServer extends haMixin("ThermostatServer", type) {
    protected currentState?: ThermostatState;

    override initialize(options?: {}) {
      this.endpoint.entityState.subscribe(this.update.bind(this));
      this.endpoint
        .eventsOf(Base)
        .systemMode$Changed.on(this.systemModeChanged.bind(this));
      return super.initialize(options);
    }

    protected async update(state: HomeAssistantEntityState) {
      this.currentState = getState(
        state as HomeAssistantEntityState<ClimateDeviceAttributes>,
      );
      const actualState = this.endpoint.stateOf(Base);
      const actualLocalTemperature = actualState.localTemperature;
      const actualSystemMode = actualState.systemMode;

      const patch: Behavior.PatchStateOf<typeof Base> = {};

      if (
        this.currentState.currentTemperature != null &&
        this.currentState.currentTemperature !== actualLocalTemperature
      ) {
        patch.localTemperature = this.currentState.currentTemperature;
      }
      if (actualSystemMode !== this.currentState.systemMode) {
        patch.systemMode = this.currentState.systemMode;
      }

      if (_.size(patch) > 0) {
        await this.endpoint.setStateOf(Base, patch);
      }
    }

    override async setpointRaiseLower(
      request: Thermostat.SetpointRaiseLowerRequest,
    ) {
      const targetTemperature = this.currentState?.targetTemperature;
      if (targetTemperature == null) {
        return;
      }
      await super.setpointRaiseLower(request);
      const newTargetTemperature =
        targetTemperature / 100 + request.amount / 10;
      await this.callAction(
        "climate",
        "set_temperature",
        { temperature: newTargetTemperature },
        { entity_id: this.entity.entity_id },
      );
    }

    protected async targetTemperatureChanged(value: number) {
      if (value === this.currentState?.targetTemperature) {
        return;
      }
      await this.callAction(
        "climate",
        "set_temperature",
        { temperature: value / 100 },
        { entity_id: this.entity.entity_id },
      );
    }

    private async systemModeChanged(systemMode: Thermostat.SystemMode) {
      if (systemMode === this.currentState?.systemMode) {
        return;
      }
      await this.callAction(
        "climate",
        "set_hvac_mode",
        { hvac_mode: getHvacMode(systemMode) },
        { entity_id: this.entity.entity_id },
      );
    }
  };
}

export const ThermostatBaseServer = Object.assign(createBaseServer, {
  createState: getState,
});

function getState(
  entity: HomeAssistantEntityState<ClimateDeviceAttributes>,
): ThermostatState {
  return {
    systemMode: getSystemMode(entity.state),
    minTemperature: getTemperature(entity.attributes.min_temp) ?? undefined,
    maxTemperature: getTemperature(entity.attributes.max_temp) ?? undefined,
    currentTemperature: getTemperature(entity.attributes.current_temperature),
    targetTemperature: getTemperature(entity.attributes.temperature) ?? 2100,
  };
}

function getSystemMode(state: string | undefined): Thermostat.SystemMode {
  switch (state ?? "off") {
    case "heat":
      return Thermostat.SystemMode.Heat;
    case "cool":
      return Thermostat.SystemMode.Cool;
  }
  return Thermostat.SystemMode.Off;
}

function getHvacMode(systemMode: Thermostat.SystemMode): ClimateHvacMode {
  switch (systemMode) {
    case Thermostat.SystemMode.Cool:
      return ClimateHvacMode.cool;
    case Thermostat.SystemMode.Heat:
      return ClimateHvacMode.heat;
    default:
      return ClimateHvacMode.off;
  }
}

function getTemperature(
  value: number | string | null | undefined,
): number | null {
  const current = value != null ? +value : null;
  if (current == null || isNaN(current)) {
    return null;
  } else {
    return current * 100;
  }
}
