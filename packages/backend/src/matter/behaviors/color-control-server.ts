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

export class ColorControlServerBase extends FeaturedBase {
  declare state: ColorControlServerBase.State;

  override async initialize() {
    await super.initialize();

    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    const attributes = homeAssistant.entity.state
      .attributes as LightDeviceAttributes;

    if (this.colorModeFromHomeAssistant(attributes.color_mode) === undefined) {
      // The color mode of the HA entity was not supported. HA will handle conversion for us, so just pick a supported default value.
      if (this.features.colorTemperature) {
        this.state.colorMode = ColorControl.ColorMode.ColorTemperatureMireds;
      } else if (this.features.hueSaturation) {
        this.state.colorMode =
          ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
      } else {
        throw new Error(
          "Cannot initialize color mode: Neither colorTemperature nor hueSaturation was supported",
        );
      }
    }

    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private colorModeFromHomeAssistant(mode: LightDeviceColorMode | undefined) {
    if (this.features.hueSaturation && mode == LightDeviceColorMode.HS) {
      return ColorControl.ColorMode.CurrentHueAndCurrentSaturation;
    } else if (
      this.features.colorTemperature &&
      mode == LightDeviceColorMode.COLOR_TEMP
    ) {
      return ColorControl.ColorMode.ColorTemperatureMireds;
    } else if (this.features.xy && mode == LightDeviceColorMode.XY) {
      return ColorControl.ColorMode.CurrentXAndCurrentY;
    }
    return undefined;
  }

  private update(entity: HomeAssistantEntityInformation) {
    const attributes = entity.state.attributes as LightDeviceAttributes;
    const minKelvin = attributes.min_color_temp_kelvin ?? 1500;
    const maxKelvin = attributes.max_color_temp_kelvin ?? 8000;
    const [hue, saturation] = this.getMatterColor(entity.state) ?? [0, 0];
    applyPatchState(this.state, {
      colorMode: this.colorModeFromHomeAssistant(attributes.color_mode),
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
                attributes.color_temp_kelvin ?? maxKelvin,
              ),
            colorTemperatureMireds: attributes.color_temp_kelvin
              ? ColorConverter.temperatureKelvinToMireds(
                  attributes.color_temp_kelvin,
                )
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

export namespace ColorControlServerBase {
  export class State extends FeaturedBase.State {}
}

export class ColorControlServer extends ColorControlServerBase.for(
  ClusterType(ColorControl.Base),
) {}
