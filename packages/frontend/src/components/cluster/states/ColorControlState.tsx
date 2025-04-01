import {
  type ColorControlClusterState,
  ColorConverter,
} from "@home-assistant-matter-hub/common";
import CircleIcon from "@mui/icons-material/Circle";
import { useMemo } from "react";

export interface ColorControlStateProps {
  state: ColorControlClusterState;
}

export const ColorControlState = ({ state }: ColorControlStateProps) => {
  const color = useMemo(() => {
    if (state.currentHue != null && state.currentSaturation != null) {
      return ColorConverter.fromMatterHS(
        state.currentHue,
        state.currentSaturation,
      ).hex();
    }
    return undefined;
  }, [state]);
  return <CircleIcon fontSize="medium" sx={{ color }} />;
};
