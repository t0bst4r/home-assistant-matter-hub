import { haMixin } from "../mixins/ha-mixin.js";
import {
  ColorConverter,
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ColorControlServer as Base } from "@project-chip/matter.js/behaviors/color-control";
import { ColorControl } from "@project-chip/matter.js/cluster";
import { Behavior } from "@project-chip/matter.js/behavior";

export class ColorTemperatureControlServer extends haMixin(
  "ColorControl",
  Base.with("ColorTemperature"),
) {
  override initialize() {
    super.initialize();
    this.endpoint.entityState.subscribe(this.update.bind(this));
  }

  protected async update(
    state: HomeAssistantEntityState<LightDeviceAttributes>,
  ) {
    const current = this.endpoint.stateOf(ColorTemperatureControlServer);
    if (state.attributes.color_mode === LightDeviceColorMode.COLOR_TEMP) {
      let kelvin = state.attributes.color_temp_kelvin;
      const minKelvin = state.attributes.min_color_temp_kelvin ?? 1500;
      const maxKelvin = state.attributes.max_color_temp_kelvin ?? 8000;
      if (kelvin != null) {
        kelvin = Math.max(Math.min(kelvin, maxKelvin), minKelvin);
        const mireds = ColorConverter.temperatureKelvinToMireds(kelvin);
        if (mireds != current.colorTemperatureMireds) {
          await this.endpoint.setStateOf(ColorTemperatureControlServer, {
            colorTemperatureMireds: mireds,
          });
        }
      }
    }
  }

  override async moveToColorTemperature(
    request: ColorControl.MoveToColorTemperatureRequest,
  ) {
    const targetKelvin = ColorConverter.temperatureMiredsToKelvin(
      request.colorTemperatureMireds,
    );
    await super.moveToColorTemperature({
      ...request,
      transitionTime: request.transitionTime ?? 1,
    });
    await this.callAction(
      "light",
      "turn_on",
      {
        color_temp_kelvin: targetKelvin,
      },
      {
        entity_id: this.entity.entity_id,
      },
    );
  }
}

export namespace ColorTemperatureControlServer {
  export function createState(
    state: HomeAssistantEntityState<LightDeviceAttributes>,
  ): Behavior.Options<typeof ColorTemperatureControlServer> {
    const minKelvin = state.attributes.min_color_temp_kelvin ?? 1500;
    const maxKelvin = state.attributes.max_color_temp_kelvin ?? 8000;
    return {
      coupleColorTempToLevelMinMireds:
        ColorConverter.temperatureKelvinToMireds(maxKelvin),
      colorTempPhysicalMinMireds:
        ColorConverter.temperatureKelvinToMireds(maxKelvin),
      colorTempPhysicalMaxMireds:
        ColorConverter.temperatureKelvinToMireds(minKelvin),
      startUpColorTemperatureMireds: ColorConverter.temperatureKelvinToMireds(
        state.attributes.color_temp_kelvin ?? maxKelvin,
      ),
      colorTemperatureMireds: state.attributes.color_temp_kelvin
        ? ColorConverter.temperatureKelvinToMireds(
            state.attributes.color_temp_kelvin,
          )
        : undefined,
    };
  }
}
