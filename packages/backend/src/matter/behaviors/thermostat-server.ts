import { ThermostatServer as Base } from "@matter/main/behaviors";
import { Thermostat } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import * as utils from "./thermostat-server-utils.js";

const FeaturedBase = Base.with("Heating", "Cooling");

export class ThermostatServerBase extends FeaturedBase {
  declare state: ThermostatServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(this.events.systemMode$Changed, this.systemModeChanged);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const attributes = entity.state.attributes as ClimateDeviceAttributes;
    const minSetpointLimit = utils.toMatterTemperature(attributes.min_temp);
    const maxSetpointLimit = utils.toMatterTemperature(attributes.max_temp);

    applyPatchState(this.state, {
      localTemperature:
        utils.toMatterTemperature(attributes.current_temperature) ?? null,
      systemMode: utils.getMatterSystemMode(
        attributes.hvac_mode ?? entity.state.state,
      ),
      thermostatRunningState: utils.getMatterRunningState(
        attributes.hvac_action,
        entity.state.state,
      ),
      controlSequenceOfOperation:
        this.features.cooling && this.features.heating
          ? Thermostat.ControlSequenceOfOperation.CoolingAndHeating
          : this.features.cooling
            ? Thermostat.ControlSequenceOfOperation.CoolingOnly
            : Thermostat.ControlSequenceOfOperation.HeatingOnly,
      ...(this.features.heating
        ? {
            occupiedHeatingSetpoint:
              this.getHeatingTemperature(attributes) ??
              this.state.occupiedHeatingSetpoint,
            minHeatSetpointLimit: minSetpointLimit,
            maxHeatSetpointLimit: maxSetpointLimit,
            absMinHeatSetpointLimit: minSetpointLimit,
            absMaxHeatSetpointLimit: maxSetpointLimit,
          }
        : {}),
      ...(this.features.cooling
        ? {
            occupiedCoolingSetpoint:
              this.getCoolingTemperature(attributes) ??
              this.state.occupiedCoolingSetpoint,
            minCoolSetpointLimit: minSetpointLimit,
            maxCoolSetpointLimit: maxSetpointLimit,
            absMinCoolSetpointLimit: minSetpointLimit,
            absMaxCoolSetpointLimit: maxSetpointLimit,
          }
        : {}),
    });
  }

  override async setpointRaiseLower(
    request: Thermostat.SetpointRaiseLowerRequest,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const state = homeAssistant.entity.state;
    const attributes = state.attributes as ClimateDeviceAttributes;

    const coolTemperature = this.getCoolingTemperature(attributes);
    const heatTemperature = this.getHeatingTemperature(attributes);
    const bothTemperature = this.getBothTemperature(attributes);

    let data: object | undefined = undefined;
    if ((attributes.hvac_mode ?? state.state) == ClimateHvacMode.heat_cool) {
      if (coolTemperature != null && heatTemperature != null) {
        const target = {
          target_temp_low: coolTemperature / 100,
          target_temp_high: heatTemperature / 100,
        };
        if (request.mode !== Thermostat.SetpointRaiseLowerMode.Cool) {
          target.target_temp_high += request.amount / 10;
        }
        if (request.mode !== Thermostat.SetpointRaiseLowerMode.Heat) {
          target.target_temp_low += request.amount / 10;
        }
        data = target;
      }
    } else {
      const currentTemperature: number | undefined =
        request.mode === Thermostat.SetpointRaiseLowerMode.Heat
          ? heatTemperature
          : request.mode === Thermostat.SetpointRaiseLowerMode.Cool
            ? coolTemperature
            : bothTemperature;
      if (currentTemperature != undefined) {
        const temperature = currentTemperature / 100 + request.amount / 10;
        data = { temperature };
      }
    }

    if (!data) {
      return;
    }
    await homeAssistant.callAction("climate.set_temperature", data);
  }

  private async systemModeChanged(systemMode: Thermostat.SystemMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const currentAttributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const current = utils.getMatterSystemMode(
      currentAttributes.hvac_mode ?? homeAssistant.entity.state.state,
    );
    if (systemMode === current) {
      return;
    }
    await homeAssistant.callAction("climate.set_hvac_mode", {
      hvac_mode: utils.getHvacModeFromMatter(systemMode),
    });
  }

  private getHeatingTemperature(attributes: ClimateDeviceAttributes) {
    return utils.toMatterTemperature(
      attributes.target_temperature_high ??
        attributes.target_temperature ??
        attributes.temperature,
    );
  }

  private getCoolingTemperature(attributes: ClimateDeviceAttributes) {
    return utils.toMatterTemperature(
      attributes.target_temperature_low ??
        attributes.target_temperature ??
        attributes.temperature,
    );
  }

  private getBothTemperature(attributes: ClimateDeviceAttributes) {
    return utils.toMatterTemperature(
      attributes.target_temperature ??
        attributes.temperature ??
        attributes.target_temperature_low ??
        attributes.target_temperature_high,
    );
  }
}

export namespace ThermostatServerBase {
  export class State extends FeaturedBase.State {}
}

export class ThermostatServer extends ThermostatServerBase.for(
  ClusterType(Thermostat.Base),
) {}
