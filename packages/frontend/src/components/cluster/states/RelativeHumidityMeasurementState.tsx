import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { RelativeHumidityMeasurementClusterState } from "@home-assistant-matter-hub/common";

export interface RelativeHumidityMeasurementStateProps {
  state: RelativeHumidityMeasurementClusterState;
}

export const RelativeHumidityMeasurementState = ({
  state,
}: RelativeHumidityMeasurementStateProps) => {
  if (state.measuredValue == null) {
    return <WaterDropIcon />;
  }
  return (
    <>
      <WaterDropIcon fontSize="medium" />
      <span>{state.measuredValue / 100} %</span>
    </>
  );
};
