import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons/faAmazon";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { Tooltip } from "@mui/material";
import QuestionMark from "@mui/icons-material/QuestionMark";
import { BridgeFabric } from "@home-assistant-matter-hub/common";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface FabricIconProps {
  fabric: BridgeFabric;
}

const iconsPerKeyword: Record<string, IconDefinition> = {
  Alexa: faAmazon,
  Apple: faApple,
  Google: faGoogle,
};

const vendorIdFallback: Record<number, IconDefinition | undefined> = {
  24582: faGoogle,
};

export const FabricIcon = ({ fabric }: FabricIconProps) => {
  let icon = Object.entries(iconsPerKeyword).find(([keyword]) =>
    fabric.label.toUpperCase().includes(keyword.toUpperCase()),
  )?.[1];

  if (!icon) {
    icon = vendorIdFallback[fabric.rootVendorId];
  }

  return (
    <Tooltip title={`${fabric.label} (${fabric.rootVendorId})`} arrow>
      <span>{icon ? <FontAwesomeIcon icon={icon} /> : <QuestionMark />}</span>
    </Tooltip>
  );
};
