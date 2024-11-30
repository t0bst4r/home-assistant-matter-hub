import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons/faAmazon";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { Tooltip } from "@mui/material";
import QuestionMark from "@mui/icons-material/QuestionMark";
import { BridgeFabric } from "@home-assistant-matter-hub/common";
import { IconLookup } from "@fortawesome/fontawesome-svg-core";
import { useMemo } from "react";

export interface FabricIconProps {
  fabric: BridgeFabric;
}

const iconsPerKeyword: Record<string, IconLookup> = {
  Alexa: faAmazon,
  Apple: faApple,
  Google: faGoogle,
};

const iconPerVendorId: Record<number, IconLookup | undefined> = {
  0x1217: faAmazon,
  0x1349: faApple,
  0x1384: faApple,
  0x6006: faGoogle,
  // 0x10e1: "Samsung SmartThings",
};

function getIcon(fabric: BridgeFabric): IconLookup | undefined {
  const icon = iconPerVendorId[fabric.rootVendorId];
  if (icon) {
    return icon;
  }
  return Object.entries(iconsPerKeyword).find(([keyword]) =>
    fabric.label.toUpperCase().includes(keyword.toUpperCase()),
  )?.[1];
}

export const FabricIcon = ({ fabric }: FabricIconProps) => {
  const icon = useMemo(() => getIcon(fabric), [fabric]);
  return (
    <Tooltip title={`${fabric.label} (${fabric.rootVendorId})`} arrow>
      <span>{icon ? <FontAwesomeIcon icon={icon} /> : <QuestionMark />}</span>
    </Tooltip>
  );
};
