import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { OccupancySensingClusterState } from "@home-assistant-matter-hub/common";

export interface OccupancySensingStateProps {
  state: OccupancySensingClusterState;
}

export const OccupancySensingState = ({
  state,
}: OccupancySensingStateProps) => {
  if (state.occupancy?.occupied) {
    return <CheckBox fontSize="medium" />;
  } else {
    return <CheckBoxOutlineBlankIcon fontSize="medium" />;
  }
};
