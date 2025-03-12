import { ThermostatServer as Base } from "@matter/main/behaviors";
import { Thermostat } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import {
  ClimateDeviceAttributes,
  ClimateDeviceFeature,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import * as utils from "./utils/thermostat-server-utils.js";
import { HomeAssistantConfig } from "../../home-assistant/home-assistant-config.js";
import { testBit } from "../../utils/test-bit.js";
import { Logger } from "@matter/main";
import { LoggerService } from "../../environment/logger.js";

const FeaturedBase = Base.with("Heating", "Cooling", "AutoMode");

export class ThermostatServerBase extends FeaturedBase {
  declare state: ThermostatServerBase.State;
  declare internal: ThermostatServerBase.Internal;

  override async initialize() {
    await super.initialize();
    this.internal.logger = this.env.get(LoggerService).get("ThermostatServer");

    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    await this.env.load(HomeAssistantConfig);

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
    const config = this.env.get(HomeAssistantConfig);

    if (this.internal.homeAssistantUnit != config.unitSystem.temperature) {
      this.internal.logger.notice(
        `Switching unit of ${entity.entity_id} to '${config.unitSystem.temperature}'`,
      );
      this.internal.homeAssistantUnit = config.unitSystem.temperature;
    }

    const attributes = entity.state.attributes as ClimateDeviceAttributes;
    const unit = this.internal.homeAssistantUnit;
    const minSetpointLimit = utils.homeAssistantToMatterTemperature(
      attributes.min_temp,
      unit,
    );
    const maxSetpointLimit = utils.homeAssistantToMatterTemperature(
      attributes.max_temp,
      unit,
    );

    applyPatchState(this.state, {
      localTemperature:
        utils.homeAssistantToMatterTemperature(
          attributes.current_temperature,
          unit,
        ) ?? null,
      systemMode: utils.getMatterSystemMode(entity.state.state, this.features),
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
              this.getHeatingTemperature(attributes, unit) ??
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
              this.getCoolingTemperature(attributes, unit) ??
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

    let cool = this.getCoolingTemperature(
      attributes,
      this.internal.homeAssistantUnit,
    );
    let heat = this.getHeatingTemperature(
      attributes,
      this.internal.homeAssistantUnit,
    );

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
    const current = utils.getMatterSystemMode(
      homeAssistant.entity.state.state,
      this.features,
    );
    if (systemMode === current) {
      return;
    }
    await homeAssistant.callAction("climate.set_hvac_mode", {
      hvac_mode: utils.getHvacModeFromMatter(systemMode),
    });
  }

  private supportsTempRange(attributes: ClimateDeviceAttributes) {
    const supportedFeatures = attributes.supported_features ?? 0;
    return testBit(
      supportedFeatures,
      ClimateDeviceFeature.TARGET_TEMPERATURE_RANGE,
    );
  }

  private async heatingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const heating = this.getHeatingTemperature(
      attributes,
      this.internal.homeAssistantUnit,
    );
    if (heating == value) {
      return;
    }
    await this.setTemperatureFromMatter(
      value,
      this.supportsTempRange(attributes)
        ? this.state.occupiedCoolingSetpoint
        : undefined,
    );
  }

  private async coolingSetpointChanged(value: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as ClimateDeviceAttributes;
    const cooling = this.getCoolingTemperature(
      attributes,
      this.internal.homeAssistantUnit,
    );
    if (cooling == value) {
      return;
    }
    await this.setTemperatureFromMatter(
      this.supportsTempRange(attributes)
        ? this.state.occupiedHeatingSetpoint
        : undefined,
      value,
    );
  }

  private async setTemperatureFromMatter(heat?: number, cool?: number) {
    if (heat == null && cool == null) {
      return;
    }

    const unit = this.internal.homeAssistantUnit;

    let data: object;
    if (heat != null && cool != null) {
      data = {
        target_temp_low: utils.matterToHomeAssistantTemperature(heat, unit),
        target_temp_high: utils.matterToHomeAssistantTemperature(cool, unit),
      };
    } else {
      data = {
        temperature: utils.matterToHomeAssistantTemperature(heat ?? cool, unit),
      };
    }

    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    await homeAssistant.callAction("climate.set_temperature", data);
  }

  private getHeatingTemperature(
    attributes: ClimateDeviceAttributes,
    unit: string,
  ) {
    return utils.homeAssistantToMatterTemperature(
      attributes.target_temp_low ??
        attributes.target_temperature ??
        attributes.temperature,
      unit,
    );
  }

  private getCoolingTemperature(
    attributes: ClimateDeviceAttributes,
    unit: string,
  ) {
    return utils.homeAssistantToMatterTemperature(
      attributes.target_temp_high ??
        attributes.target_temperature ??
        attributes.temperature,
      unit,
    );
  }
}

export namespace ThermostatServerBase {
  export class State extends FeaturedBase.State {}

  export class Internal extends FeaturedBase.Internal {
    homeAssistantUnit!: string;
    logger!: Logger;
  }
}

export class ThermostatServer extends ThermostatServerBase.for(
  ClusterType(Thermostat.Base),
) {}
