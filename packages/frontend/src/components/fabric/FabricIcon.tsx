import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons/faAmazon";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { Tooltip } from "@mui/material";
import QuestionMark from "@mui/icons-material/QuestionMark";
import { BridgeFabric } from "@home-assistant-matter-hub/common";

export interface FabricIconProps {
  fabric: BridgeFabric;
}

export const FabricIcon = ({ fabric }: FabricIconProps) => {
  const icon = useMemo(() => {
    if (fabric.label.includes("Alexa")) {
      return <FontAwesomeIcon icon={faAmazon} />;
    } else if (fabric.label.includes("Apple")) {
      return <FontAwesomeIcon icon={faApple} />;
    } else if (fabric.label.includes("Google")) {
      return <FontAwesomeIcon icon={faGoogle} />;
    } else {
      return <QuestionMark />;
    }
  }, [fabric]);

  return (
    <Tooltip title={`${fabric.label} (${fabric.rootVendorId})`} arrow>
      <span>{icon}</span>
    </Tooltip>
  );
};
