import type { EndpointData } from "@home-assistant-matter-hub/common";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import BlindsIcon from "@mui/icons-material/Blinds";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import UnknownIcon from "@mui/icons-material/HelpOutline";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LockIcon from "@mui/icons-material/Lock";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SensorOccupiedIcon from "@mui/icons-material/SensorOccupied";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SpeakerIcon from "@mui/icons-material/Speaker";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import WaterDamageIcon from "@mui/icons-material/WaterDamage";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WindPowerIcon from "@mui/icons-material/WindPower";
import Tooltip from "@mui/material/Tooltip";
import { useMemo } from "react";

export interface EndpointIconProps {
  endpoint: EndpointData;
}

export const EndpointIcon = ({ endpoint }: EndpointIconProps) => {
  const SelectedIcon = useMemo(() => {
    switch (endpoint.type.name) {
      case "RootNode":
        return <DeviceHubIcon />;
      case "Aggregator":
        return <GroupWorkIcon />;
      case "OnOffPlugInUnit":
        return <ToggleOnIcon />;
      case "OnOffLight":
      case "ExtendedColorLight":
      case "ColorTemperatureLight":
      case "DimmableLight":
        return <LightbulbIcon />;
      case "TemperatureSensor":
        return <ThermostatIcon />;
      case "Thermostat":
        return <AcUnitIcon />;
      case "Fan":
        return <WindPowerIcon />;
      case "OnOffSensor":
        return <CheckBoxIcon />;
      case "HumiditySensor":
        return <WaterDropIcon />;
      case "WindowCovering":
        return <BlindsIcon />;
      case "DoorLock":
        return <LockIcon />;
      case "OccupancySensor":
        return <SensorOccupiedIcon />;
      case "ContactSensor":
        return <MeetingRoomIcon />;
      case "WaterLeakDetector":
        return <WaterDamageIcon />;
      case "Speaker":
        return <SpeakerIcon />;
      case "RoboticVacuumCleaner":
        return <SmartToyIcon />;
      default:
        return <UnknownIcon />;
    }
  }, [endpoint]);

  return (
    <Tooltip title={`${endpoint.type.name} (${endpoint.type.id})`}>
      {SelectedIcon}
    </Tooltip>
  );
};
