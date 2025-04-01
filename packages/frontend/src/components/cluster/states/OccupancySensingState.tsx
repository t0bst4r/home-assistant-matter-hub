import type { OccupancySensingClusterState } from "@home-assistant-matter-hub/common";
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

export interface OccupancySensingStateProps {
  state: OccupancySensingClusterState;
}

export const OccupancySensingState = ({
  state,
}: OccupancySensingStateProps) => {
  if (state.occupancy?.occupied) {
    return <CheckBox fontSize="medium" />;
  }
  return <CheckBoxOutlineBlankIcon fontSize="medium" />;
};
