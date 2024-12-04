import { Tooltip } from "@mui/material";
import QuestionMark from "@mui/icons-material/QuestionMark";
import { BridgeFabric } from "@home-assistant-matter-hub/common";
import { FC, SVGProps, useMemo } from "react";

import AmazonIcon from "../../assets/brands/Amazon.svg?react";
import AppleIcon from "../../assets/brands/Apple.svg?react";
import GoogleIcon from "../../assets/brands/Google.svg?react";
import SamsungIcon from "../../assets/brands/Samsung.svg?react";
import Box from "@mui/material/Box";

export interface FabricIconProps {
  fabric: BridgeFabric;
}

const iconsPerKeyword: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  Alexa: AmazonIcon,
  Apple: AppleIcon,
  Google: GoogleIcon,
};

const iconPerVendorId: Record<number, FC<SVGProps<SVGSVGElement>> | undefined> =
  {
    0x1217: AmazonIcon,
    0x1349: AppleIcon,
    0x1384: AppleIcon,
    0x6006: GoogleIcon,
    0x10e1: SamsungIcon,
    0x110a: SamsungIcon,
  };

function getIcon(fabric: BridgeFabric) {
  const icon = iconPerVendorId[fabric.rootVendorId];
  if (icon) {
    return icon;
  }
  return Object.entries(iconsPerKeyword).find(([keyword]) =>
    fabric.label.toUpperCase().includes(keyword.toUpperCase()),
  )?.[1];
}

export const FabricIcon = ({ fabric }: FabricIconProps) => {
  const BrandIcon = useMemo(() => getIcon(fabric), [fabric]);
  return (
    <Tooltip
      title={`${fabric.label} (0x${fabric.rootVendorId.toString(16)})`}
      arrow
    >
      <Box
        component="span"
        sx={{ fill: (theme) => theme.palette.text.primary }}
      >
        {BrandIcon ? (
          <BrandIcon
            style={{
              maxHeight: "1em",
              maxWidth: "3em",
            }}
          />
        ) : (
          <QuestionMark />
        )}
      </Box>
    </Tooltip>
  );
};
