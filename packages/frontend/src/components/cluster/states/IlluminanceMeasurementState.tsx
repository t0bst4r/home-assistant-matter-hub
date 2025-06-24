import type { IlluminanceMeasurementClusterState } from "@home-assistant-matter-hub/common";
import LightModeIcon from "@mui/icons-material/LightMode";

export interface IlluminanceMeasurementStateProps {
  state: IlluminanceMeasurementClusterState;
}

export const IlluminanceMeasurementState = ({
  state,
}: IlluminanceMeasurementStateProps) => {
  if (state.measuredValue == null) {
    return <LightModeIcon />;
  }
  return (
    <>
      <LightModeIcon fontSize="medium" />
      <span>{state.measuredValue / 100} lx</span>
    </>
  );
};
