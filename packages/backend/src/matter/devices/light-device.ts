import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import {
  BridgeBasicInformation,
  HomeAssistantEntityRegistryWithInitialState,
  LightDeviceAttributes,
  LightDeviceColorMode,
} from "@home-assistant-matter-hub/common";
import {
  extendedColorLightOptions,
  ExtendedColorLightType,
} from "./light/extended-color-light.js";
import { EndpointType } from "@project-chip/matter.js/endpoint/type";
import { Endpoint } from "@project-chip/matter.js/endpoint";
import {
  colorTemperatureLightOptions,
  ColorTemperatureLightType,
} from "./light/color-temperature-light.js";
import {
  dimmableLightOptions,
  DimmableLightType,
} from "./light/dimmable-light.js";
import {
  onOffLightOptions,
  OnOffLightType,
} from "./light/on-off-light-device.js";

const brightnessModes: LightDeviceColorMode[] = Object.values(
  LightDeviceColorMode,
)
  .filter((mode) => mode !== LightDeviceColorMode.UNKNOWN)
  .filter((mode) => mode !== LightDeviceColorMode.ONOFF);

const colorModes: LightDeviceColorMode[] = [
  LightDeviceColorMode.HS,
  LightDeviceColorMode.RGB,
  LightDeviceColorMode.XY,
  // TODO: ColorMode.RGBW, not yet supported
  // TODO: ColorMode.RGBWW, not yet supported
];

export class LightDevice extends MatterDevice {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) {
    const entity =
      props.entity as HomeAssistantEntityRegistryWithInitialState<LightDeviceAttributes>;
    const supportedColorModes: LightDeviceColorMode[] =
      entity.initialState.attributes.supported_color_modes ?? [];
    const supportsBrightness = supportedColorModes.some((mode) =>
      brightnessModes.includes(mode),
    );
    const supportsColorControl = supportedColorModes.some((mode) =>
      colorModes.includes(mode),
    );
    const supportsColorTemperature = supportedColorModes.includes(
      LightDeviceColorMode.COLOR_TEMP,
    );

    let type: EndpointType;
    let options: Endpoint.Options;
    if (supportsColorControl) {
      type = ExtendedColorLightType;
      options = extendedColorLightOptions(basicInformation, props);
    } else if (supportsColorTemperature) {
      type = ColorTemperatureLightType;
      options = colorTemperatureLightOptions(basicInformation, props);
    } else if (supportsBrightness) {
      type = DimmableLightType;
      options = dimmableLightOptions(basicInformation, props);
    } else {
      type = OnOffLightType;
      options = onOffLightOptions(basicInformation, props);
    }
    super(type, options, props);
  }
}
