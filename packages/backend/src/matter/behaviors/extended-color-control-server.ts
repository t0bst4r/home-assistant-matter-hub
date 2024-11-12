import {
  ColorConverter,
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ColorControlServer as Base } from "@matter/main/behaviors/color-control";
import { ColorControl } from "@matter/main/clusters";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";

export class ExtendedColorControlServer extends Base.with(
  "ColorTemperature",
  "HueSaturation",
) {
  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    const state = homeAssistant.state
      .entity as HomeAssistantEntityState<LightDeviceAttributes>;
    const minKelvin = state.attributes.min_color_temp_kelvin ?? 1500;
    const maxKelvin = state.attributes.max_color_temp_kelvin ?? 8000;
    this.state.coupleColorTempToLevelMinMireds = Math.floor(
      ColorConverter.temperatureKelvinToMireds(maxKelvin),
    );
    this.state.colorTempPhysicalMinMireds = Math.floor(
      ColorConverter.temperatureKelvinToMireds(maxKelvin),
    );
    this.state.colorTempPhysicalMaxMireds = Math.ceil(
      ColorConverter.temperatureKelvinToMireds(minKelvin),
    );
    this.state.startUpColorTemperatureMireds =
      ColorConverter.temperatureKelvinToMireds(
        state.attributes.color_temp_kelvin ?? maxKelvin,
      );
    if (state.attributes.color_temp_kelvin) {
      this.state.colorTemperatureMireds =
        ColorConverter.temperatureKelvinToMireds(
          state.attributes.color_temp_kelvin,
        );
    }
    homeAssistant.onChange.on(this.callback(this.update));
  }

  protected async update(
    state: HomeAssistantEntityState<LightDeviceAttributes>,
  ) {
    const color = this.getMatterColor(state);
    if (state.attributes.color_mode === LightDeviceColorMode.COLOR_TEMP) {
      let kelvin = state.attributes.color_temp_kelvin;
      const minKelvin = state.attributes.min_color_temp_kelvin ?? 1500;
      const maxKelvin = state.attributes.max_color_temp_kelvin ?? 8000;
      if (kelvin != null) {
        kelvin = Math.max(Math.min(kelvin, maxKelvin), minKelvin);
        const mireds = ColorConverter.temperatureKelvinToMireds(kelvin);
        if (mireds != this.state.colorTemperatureMireds) {
          this.state.colorTemperatureMireds = mireds;
        }
      }
    } else {
      if (color != null) {
        const [hue, saturation] = color;
        if (
          this.state.currentHue !== hue ||
          this.state.currentSaturation !== saturation
        ) {
          Object.assign(this.state, {
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
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const targetKelvin = ColorConverter.temperatureMiredsToKelvin(
      request.colorTemperatureMireds,
    );
    await super.moveToColorTemperature({
      ...request,
      transitionTime: request.transitionTime ?? 1,
    });
    await homeAssistant.callAction(
      "light",
      "turn_on",
      {
        color_temp_kelvin: targetKelvin,
      },
      {
        entity_id: homeAssistant.entityId,
      },
    );
  }

  override async moveToHueAndSaturation(
    request: ColorControl.MoveToHueAndSaturationRequest,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    await super.moveToHueAndSaturation({
      ...request,
      transitionTime: request.transitionTime ?? 1,
    });
    const color = ColorConverter.fromMatterHS(request.hue, request.saturation);
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    await homeAssistant.callAction(
      "light",
      "turn_on",
      {
        hs_color: [hue, saturation],
      },
      {
        entity_id: homeAssistant.entityId,
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
