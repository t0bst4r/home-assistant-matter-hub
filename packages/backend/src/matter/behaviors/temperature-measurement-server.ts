import type {
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { TemperatureMeasurementServer as Base } from "@matter/main/behaviors";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import type { Temperature } from "../../utils/converters/temperature.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter } from "./utils/cluster-config.js";

export interface TemperatureMeasurementConfig {
  getValue: ValueGetter<Temperature | undefined>;
}

class TemperatureMeasurementServerBase extends Base {
  declare state: TemperatureMeasurementServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      measuredValue: this.getTemperature(entity.state) ?? null,
    });
  }

  private getTemperature(entity: HomeAssistantEntityState): number | undefined {
    const value = this.state.config.getValue(entity, this.agent);
    if (!value) {
      return undefined;
    }
    return Math.round(value.celsius() * 100);
  }
}

namespace TemperatureMeasurementServerBase {
  export class State extends Base.State {
    config!: TemperatureMeasurementConfig;
  }
}

export function TemperatureMeasurementServer(
  config: TemperatureMeasurementConfig,
) {
  return TemperatureMeasurementServerBase.set({ config });
}
