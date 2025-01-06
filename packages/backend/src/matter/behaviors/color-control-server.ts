import {
  ColorConverter,
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import { ColorControlServer as Base } from "@matter/main/behaviors/color-control";
import { ColorControl } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { ClusterType } from "@matter/main/types";
import { applyPatchState } from "../../utils/apply-patch-state.js";

const FeaturedBase = Base.with("ColorTemperature", "HueSaturation");

export interface ColorControlConfig {
  expandMinMaxTemperature?: boolean;
}

export class ColorControlServerBase extends FeaturedBase {
  declare state: ColorControlServerBase.State;

  override async initialize() {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const attributes = entity.state.attributes as LightDeviceAttributes;
    const currentKelvin = attributes.color_temp_kelvin;
    let minKelvin = attributes.min_color_temp_kelvin ?? 1500;
    let maxKelvin = attributes.max_color_temp_kelvin ?? 8000;
    if (this.state.config?.expandMinMaxTemperature == true) {
      minKelvin = Math.min(minKelvin, currentKelvin ?? Infinity);
      maxKelvin = Math.max(maxKelvin, currentKelvin ?? -Infinity);
    }
    minKelvin = Math.min(Math.max(minKelvin, 0), 65279);
    maxKelvin = Math.min(Math.max(maxKelvin, 0), 65279);
    const [hue, saturation] = this.getMatterColor(entity.state) ?? [0, 0];
    applyPatchState(this.state, {
      colorMode: this.getMatterColorMode(attributes.color_mode),
      ...(this.features.hueSaturation
        ? {
            currentHue: hue,
            currentSaturation: saturation,
          }
        : {}),
      ...(this.features.colorTemperature
        ? {
            coupleColorTempToLevelMinMireds: Math.floor(
              ColorConverter.temperatureKelvinToMireds(maxKelvin),
            ),
            colorTempPhysicalMinMireds: Math.floor(
              ColorConverter.temperatureKelvinToMireds(maxKelvin),
            ),
            colorTempPhysicalMaxMireds: Math.ceil(
              ColorConverter.temperatureKelvinToMireds(minKelvin),
            ),
            startUpColorTemperatureMireds:
              ColorConverter.temperatureKelvinToMireds(
                currentKelvin ?? maxKelvin,
              ),
            colorTemperatureMireds: currentKelvin
              ? ColorConverter.temperatureKelvinToMireds(currentKelvin)
              : undefined,
          }
        : {}),
    });
  }

  override async moveToColorTemperatureLogic(targetMireds: number) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const current = homeAssistant.entity
      .state as HomeAssistantEntityState<LightDeviceAttributes>;
    const targetKelvin = ColorConverter.temperatureMiredsToKelvin(targetMireds);

    if (current.attributes.color_temp_kelvin === targetKelvin) {
      return;
    }

    await homeAssistant.callAction("light.turn_on", {
      color_temp_kelvin: targetKelvin,
    });
  }

  override async moveToHueLogic(targetHue: number) {
    await this.moveToHueAndSaturationLogic(
      targetHue,
      this.state.currentSaturation,
    );
  }

  override async moveToSaturationLogic(targetSaturation: number) {
    await this.moveToHueAndSaturationLogic(
      this.state.currentHue,
      targetSaturation,
    );
  }

  override async moveToHueAndSaturationLogic(
    targetHue: number,
    targetSaturation: number,
  ) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const [currentHue, currentSaturation] =
      this.getMatterColor(homeAssistant.entity.state) ?? [];
    if (currentHue == targetHue && currentSaturation == targetSaturation) {
      return;
    }
    const color = ColorConverter.fromMatterHS(targetHue, targetSaturation);
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    await homeAssistant.callAction("light.turn_on", {
      hs_color: [hue, saturation],
    });
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

  private getMatterColorMode(
    mode: LightDeviceColorMode | undefined,
  ): ColorControl.ColorMode {
    // This cluster is only used with HueSaturation, ColorTemperature or Both.
    // It is never used without any of them.
    if (this.features.colorTemperature && this.features.hueSaturation) {
      if (mode === LightDeviceColorMode.COLOR_TEMP) {
        return ColorControl.ColorMode.ColorTemperatureMireds;
      } else {
        return ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
      }
    } else if (this.features.colorTemperature) {
      return ColorControl.ColorMode.ColorTemperatureMireds;
    } else if (this.features.hueSaturation) {
      return ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
    } else {
      throw new Error(
        "ColorControlServer does not support either HueSaturation or ColorTemperature",
      );
    }
  }
}

export namespace ColorControlServerBase {
  export class State extends FeaturedBase.State {
    config?: ColorControlConfig;
  }
}

export class ColorControlServer extends ColorControlServerBase.for(
  ClusterType(ColorControl.Base),
) {}
