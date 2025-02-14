import {
  ColorConverter,
  HomeAssistantEntityInformation,
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { ColorControlServer as Base } from "@matter/main/behaviors/color-control";
import { ColorControl } from "@matter/main/clusters";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { ClusterType } from "@matter/main/types";
import type { ColorInstance } from "color";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { getMatterColorMode } from "./utils/color-control-server-utils.js";

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
      if (minKelvin > maxKelvin) {
        [minKelvin, maxKelvin] = [maxKelvin, minKelvin];
      }
    }
    const [hue, saturation] = this.getMatterColor(entity.state) ?? [0, 0];
    applyPatchState(this.state, {
      colorMode: getMatterColorMode(attributes.color_mode, this.features),
      ...(this.features.hueSaturation
        ? {
            currentHue: hue,
            currentSaturation: saturation,
          }
        : {}),
      ...(this.features.colorTemperature
        ? {
            coupleColorTempToLevelMinMireds:
              ColorConverter.temperatureKelvinToMireds(maxKelvin, "floor"),
            colorTempPhysicalMinMireds:
              ColorConverter.temperatureKelvinToMireds(maxKelvin, "floor"),
            colorTempPhysicalMaxMireds:
              ColorConverter.temperatureKelvinToMireds(minKelvin, "ceil"),
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
    let color: ColorInstance | undefined = undefined;
    if (entity.attributes.hs_color != null) {
      const [hue, saturation] = entity.attributes.hs_color;
      color = ColorConverter.fromHomeAssistantHS(hue, saturation);
    } else if (entity.attributes.rgbww_color != null) {
      const [r, g, b, cw, ww] = entity.attributes.rgbww_color;
      color = ColorConverter.fromRGBWW(r, g, b, cw, ww);
    } else if (entity.attributes.rgbw_color != null) {
      const [r, g, b, w] = entity.attributes.rgbw_color;
      color = ColorConverter.fromRGBW(r, g, b, w);
    } else if (entity.attributes.rgb_color != null) {
      const [r, g, b] = entity.attributes.rgb_color;
      color = ColorConverter.fromRGB(r, g, b);
    } else if (entity.attributes.xy_color != null) {
      const [x, y] = entity.attributes.xy_color;
      color = ColorConverter.fromXY(x, y);
    }
    return color ? ColorConverter.toMatterHS(color) : undefined;
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
