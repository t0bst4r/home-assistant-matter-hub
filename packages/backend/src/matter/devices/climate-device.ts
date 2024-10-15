import { MatterDevice, MatterDeviceProps } from "../matter-device.js";
import { ThermostatDevice } from "@project-chip/matter.js/devices/ThermostatDevice";
import { BasicInformationServer } from "../behaviors/basic-information-server.js";
import { IdentifyServer } from "../behaviors/identify-server.js";
import {
  BridgeBasicInformation,
  ClimateDeviceAttributes,
  ClimateHvacMode,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { ThermostatServer } from "../behaviors/thermostat-server.js";
import { Endpoint } from "@project-chip/matter.js/endpoint";

const ClimateDeviceType = ThermostatDevice.with(
  BasicInformationServer,
  IdentifyServer,
);

const coolingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.cool,
];
const heatingModes: ClimateHvacMode[] = [
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.heat,
];

export class ClimateDevice extends MatterDevice<typeof ClimateDeviceType> {
  constructor(
    basicInformation: BridgeBasicInformation,
    props: MatterDeviceProps,
  ) {
    const entity = props.entity
      .initialState as HomeAssistantEntityState<ClimateDeviceAttributes>;
    const supportsCooling = coolingModes.some((mode) =>
      entity.attributes.hvac_modes.includes(mode),
    );
    const supportsHeating = heatingModes.some((mode) =>
      entity.attributes.hvac_modes.includes(mode),
    );
    const thermostat = ThermostatServer(supportsCooling, supportsHeating);
    const type = ClimateDeviceType.with(thermostat);
    const options: Endpoint.Options<typeof type> = {
      bridgedDeviceBasicInformation: BasicInformationServer.createState(
        basicInformation,
        entity,
      ),
      thermostat: thermostat.createState(entity),
    };
    super(type, options, props);
  }
}
