import {
  FanControlAirflowDirection,
  FanControlClusterState,
  FanControlFanMode,
} from "@home-assistant-matter-hub/common";
import { SvgIcon } from "@mui/material";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import PowerOnIcon from "@mui/icons-material/Power";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export interface FanControlStateProps {
  state: FanControlClusterState;
}

const Icons: Record<FanControlFanMode, typeof SvgIcon> = {
  [FanControlFanMode.Off]: PowerOffIcon,
  [FanControlFanMode.Low]: PowerOnIcon,
  [FanControlFanMode.Medium]: PowerOnIcon,
  [FanControlFanMode.High]: PowerOnIcon,
  [FanControlFanMode.On]: PowerOnIcon,
  [FanControlFanMode.Auto]: AutoAwesomeIcon,
  [FanControlFanMode.Smart]: AutoAwesomeIcon,
};
const Labels: Record<FanControlFanMode, string> = {
  [FanControlFanMode.Off]: "Off",
  [FanControlFanMode.Low]: "Low",
  [FanControlFanMode.Medium]: "Medium",
  [FanControlFanMode.High]: "High",
  [FanControlFanMode.On]: "On",
  [FanControlFanMode.Auto]: "Auto",
  [FanControlFanMode.Smart]: "Smart",
};

export const FanControlState = ({ state }: FanControlStateProps) => {
  const mode = state.fanMode ?? FanControlFanMode.Off;
  const Icon = Icons[mode];

  return (
    <>
      <Icon fontSize="medium" />
      <span>{Labels[mode]}</span>
      {state.percentCurrent != null && <span>, {state.percentCurrent} %</span>}
      <span>
        ,{" "}
        {state.airflowDirection === FanControlAirflowDirection.Forward
          ? "Forward"
          : "Reverse"}
      </span>
    </>
  );
};
