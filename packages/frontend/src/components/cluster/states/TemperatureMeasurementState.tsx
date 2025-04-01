import type { TemperatureMeasurementClusterState } from "@home-assistant-matter-hub/common";
import ThermostatIcon from "@mui/icons-material/Thermostat";

export interface TemperatureMeasurementStateProps {
  state: TemperatureMeasurementClusterState;
}

export const TemperatureMeasurementState = ({
  state,
}: TemperatureMeasurementStateProps) => {
  if (state.measuredValue == null) {
    return <ThermostatIcon fontSize="medium" />;
  }
  return (
    <>
      <ThermostatIcon fontSize="medium" />
      <span>{state.measuredValue / 100} °C</span>
    </>
  );
};
