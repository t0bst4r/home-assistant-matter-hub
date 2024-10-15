import { haMixin } from "../mixins/ha-mixin.js";
import {
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ColorConverter } from "@home-assistant-matter-hub/common";
import { ColorControlServer as Base } from "@project-chip/matter.js/behaviors/color-control";
import { ColorControl } from "@project-chip/matter.js/cluster";
import { Behavior } from "@project-chip/matter.js/behavior";

export class ExtendedColorControlServer extends haMixin(
  "ColorControl",
  Base.with("ColorTemperature", "HueSaturation"),
) {
  override initialize() {
    super.initialize();
    this.endpoint.entityState.subscribe(this.update.bind(this));
  }

  protected async update(
    state: HomeAssistantEntityState<LightDeviceAttributes>,
  ) {
    const current = this.endpoint.stateOf(ExtendedColorControlServer);
    const color = this.getMatterColor(state);
    if (state.attributes.color_mode === LightDeviceColorMode.COLOR_TEMP) {
      const kelvin = state.attributes.color_temp_kelvin;
      if (kelvin != null) {
        const mireds = ColorConverter.temperatureKelvinToMireds(kelvin);
        if (mireds != current.colorTemperatureMireds) {
          await this.endpoint.setStateOf(ExtendedColorControlServer, {
            colorTemperatureMireds: mireds,
          });
        }
      }
    } else {
      if (color != null) {
        const [hue, saturation] = color;
        if (
          current.currentHue !== hue ||
          current.currentSaturation !== saturation
        ) {
          await this.endpoint.setStateOf(ExtendedColorControlServer, {
            currentHue: hue,
            currentSaturation: saturation,
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
    await super.moveToColorTemperature(request);
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

  override async moveToHueAndSaturation(
    request: ColorControl.MoveToHueAndSaturationRequest,
  ) {
    await super.moveToHueAndSaturation(request);
    const color = ColorConverter.fromMatterHS(request.hue, request.saturation);
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    await this.callAction(
      "light",
      "turn_on",
      {
        hs_color: [hue, saturation],
      },
      {
        entity_id: this.entity.entity_id,
      },
    );
  }

  private getMatterColor(
    entity: HomeAssistantEntityState<LightDeviceAttributes>,
  ): [hue: number, saturation: number] | undefined {
    const hsColor: [number, number] | undefined = entity.attributes.hs_color;
    const xyColor: [number, number] | undefined = entity.attributes.xy_color;
    const rgbColor: [number, number, number] | undefined =
      entity.attributes.rgb_color;
    if (hsColor != null) {
      const [hue, saturation] = hsColor;
      return ColorConverter.toMatterHS(
        ColorConverter.fromHomeAssistantHS(hue, saturation),
      );
    } else if (rgbColor != null) {
      const [r, g, b] = rgbColor;
      return ColorConverter.toMatterHS(ColorConverter.fromRGB(r, g, b));
    } else if (xyColor != null) {
      const [x, y] = xyColor;
      return ColorConverter.toMatterHS(ColorConverter.fromXY(x, y));
    }
    return undefined;
  }
}

export namespace ExtendedColorControlServer {
  export function createState(
    state: HomeAssistantEntityState<LightDeviceAttributes>,
  ): Behavior.Options<typeof ExtendedColorControlServer> {
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
