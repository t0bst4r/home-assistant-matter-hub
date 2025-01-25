import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import QrCode from "@mui/icons-material/QrCode";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BridgeStatusIcon } from "./BridgeStatusIcon.tsx";
import { Link as RouterLink } from "react-router";
import { navigation } from "../../routes.tsx";

export interface BridgeCardProps {
  bridge: BridgeDataWithMetadata;
}

export const BridgeCard = ({ bridge }: BridgeCardProps) => {
  return (
    <Card variant="elevation">
      <CardActionArea component={RouterLink} to={navigation.bridge(bridge.id)}>
        <CardContent sx={{ display: "flex" }}>
          <Box display="flex" alignItems="center">
            <QrCode sx={{ height: "3em", width: "3em" }} />
          </Box>
          <Box
            pl={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            flexGrow={1}
          >
            <Typography>
              {bridge.name} <BridgeStatusIcon status={bridge.status} />
            </Typography>
            <Grid container>
              <Grid size={6}>
                <Typography variant="caption" component="div">
                  <div>
                    Fabrics: {bridge.commissioning?.fabrics.length ?? 0}
                  </div>
                  <div>Devices: {bridge.deviceCount}</div>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" component="div">
                  <div>Port: {bridge.port}</div>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
