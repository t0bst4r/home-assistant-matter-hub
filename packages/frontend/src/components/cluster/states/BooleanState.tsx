import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { BooleanStateClusterState } from "@home-assistant-matter-hub/common";

export interface BooleanStateProps {
  state: BooleanStateClusterState;
}

export const BooleanState = ({ state }: BooleanStateProps) => {
  if (state.stateValue) {
    return <CheckBox fontSize="medium" />;
  } else {
    return <CheckBoxOutlineBlankIcon fontSize="medium" />;
  }
};
