import type { BooleanStateClusterState } from "@home-assistant-matter-hub/common";
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

export interface BooleanStateProps {
  state: BooleanStateClusterState;
}

export const BooleanState = ({ state }: BooleanStateProps) => {
  if (state.stateValue) {
    return <CheckBox fontSize="medium" />;
  }
  return <CheckBoxOutlineBlankIcon fontSize="medium" />;
};
