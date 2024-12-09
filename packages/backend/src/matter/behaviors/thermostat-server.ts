import { ThermostatServer as Base } from "@matter/main/behaviors";
import { Thermostat } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  ClimateDeviceAttributes,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import * as utils from "./thermostat-server-utils.js";

const FeaturedBase = Base.with("Heating", "Cooling", "AutoMode");

export class ThermostatServerBase extends FeaturedBase {
  declare state: ThermostatServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(this.events.systemMode$Changed, this.systemModeChanged);
    if (this.features.cooling) {
      this.reactTo(
        this.events.occupiedCoolingSetpoint$Changed,
        this.coolingSetpointChanged,
      );
    }
    if (this.features.heating) {
      this.reactTo(
        this.events.occupiedHeatingSetpoint$Changed,
        this.heatingSetpointChanged,
      );
    }
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
        this.features,
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
      ...(this.features.autoMode
        ? {
            minSetpointDeadBand: 0,
            thermostatRunningMode: utils.getMatterRunningMode(
              attributes.hvac_action,
            ),
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

    let cool = this.getCoolingTemperature(attributes);
    let heat = this.getHeatingTemperature(attributes);

    if (
      request.mode !== Thermostat.SetpointRaiseLowerMode.Cool &&
      heat != null
    ) {
      heat += request.amount / 10;
    }
    if (
      request.mode !== Thermostat.SetpointRaiseLowerMode.Heat &&
      cool != null
    ) {
      cool += request.amount / 10;
    }

    await this.setTemperatureFromMatter(heat, cool);
  }

  private async systemModeChanged(systemMode: Thermostat.SystemMode) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const currentAttributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const current = utils.getMatterSystemMode(
      currentAttributes.hvac_mode ?? homeAssistant.entity.state.state,
      this.features,
    );
    if (systemMode === current) {
      return;
    }
    await homeAssistant.callAction("climate.set_hvac_mode", {
      hvac_mode: utils.getHvacModeFromMatter(systemMode),
    });
  }

  private async heatingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const heating = this.getHeatingTemperature(attributes);
    if (heating == value) {
      return;
    }
    await this.setTemperatureFromMatter(
      value,
      this.state.occupiedCoolingSetpoint,
    );
  }

  private async coolingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const cooling = this.getCoolingTemperature(attributes);
    if (cooling == value) {
      return;
    }
    await this.setTemperatureFromMatter(
      this.state.occupiedHeatingSetpoint,
      value,
    );
  }

  private async setTemperatureFromMatter(heat?: number, cool?: number) {
    if (heat == null && cool == null) {
      return;
    }
    const fallback = (heat ?? cool)!;

    let data: object;
    if (heat != null && cool != null) {
      data = {
        target_temp_low: (heat ?? fallback) / 100,
        target_temp_high: (cool ?? fallback) / 100,
      };
    } else {
      data = { temperature: fallback / 100 };
    }

    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("climate.set_temperature", data);
  }

  private getHeatingTemperature(attributes: ClimateDeviceAttributes) {
    return utils.toMatterTemperature(
      attributes.target_temp_low ??
        attributes.target_temperature ??
        attributes.temperature,
    );
  }

  private getCoolingTemperature(attributes: ClimateDeviceAttributes) {
    return utils.toMatterTemperature(
      attributes.target_temp_high ??
        attributes.target_temperature ??
        attributes.temperature,
    );
  }
}

export namespace ThermostatServerBase {
  export class State extends FeaturedBase.State {}
}

export class ThermostatServer extends ThermostatServerBase.for(
  ClusterType(Thermostat.Base),
) {}
