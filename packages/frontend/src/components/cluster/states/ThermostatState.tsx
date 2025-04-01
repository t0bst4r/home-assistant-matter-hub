import {
  type ThermostatClusterState,
  ThermostatSystemMode,
} from "@home-assistant-matter-hub/common";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AirIcon from "@mui/icons-material/Air";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import type { SvgIcon } from "@mui/material";

export interface ThermostatStateProps {
  state: ThermostatClusterState;
}

const Icons: Record<ThermostatSystemMode, typeof SvgIcon> = {
  [ThermostatSystemMode.Off]: PowerOffIcon,
  [ThermostatSystemMode.Auto]: AutoAwesomeIcon,
  [ThermostatSystemMode.Cool]: AcUnitIcon,
  [ThermostatSystemMode.Heat]: LocalFireDepartmentIcon,
  [ThermostatSystemMode.EmergencyHeat]: LocalFireDepartmentIcon,
  [ThermostatSystemMode.Precooling]: AcUnitIcon,
  [ThermostatSystemMode.FanOnly]: AirIcon,
  [ThermostatSystemMode.Dry]: DryCleaningIcon,
  [ThermostatSystemMode.Sleep]: BedtimeIcon,
};
const Labels: Record<ThermostatSystemMode, string> = {
  [ThermostatSystemMode.Off]: "Off",
  [ThermostatSystemMode.Auto]: "Auto",
  [ThermostatSystemMode.Cool]: "Cool",
  [ThermostatSystemMode.Heat]: "Heat",
  [ThermostatSystemMode.EmergencyHeat]: "Emergency Heat",
  [ThermostatSystemMode.Precooling]: "Precooling",
  [ThermostatSystemMode.FanOnly]: "Fan Only",
  [ThermostatSystemMode.Dry]: "Dry",
  [ThermostatSystemMode.Sleep]: "Sleep",
};

export const ThermostatState = ({ state }: ThermostatStateProps) => {
  const Icon = Icons[state.systemMode ?? ThermostatSystemMode.Off];

  return (
    <>
      <Icon fontSize="medium" />
      <span>{Labels[state.systemMode ?? ThermostatSystemMode.Off]}</span>
      {state.localTemperature != null && (
        <span>, {state.localTemperature / 100} °C</span>
      )}
    </>
  );
};
