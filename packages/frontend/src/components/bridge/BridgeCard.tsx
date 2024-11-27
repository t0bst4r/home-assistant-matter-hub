import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import QrCode from "@mui/icons-material/QrCode";
import Remove from "@mui/icons-material/Delete";
import {
  CardActionArea,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRef, useState } from "react";
import { BridgeStatusIcon } from "./BridgeStatusIcon.tsx";

export interface BridgeCardProps {
  bridge: BridgeDataWithMetadata;
  active?: boolean;
  onClick: () => void;
  onDelete: () => void;
  onReset: () => void;
}

export const BridgeCard = ({
  bridge,
  onClick,
  active,
  onDelete,
  onReset,
}: BridgeCardProps) => {
  const menuAnchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const deleteClick = () => {
    setMenuOpen(false);
    onDelete();
  };

  const resetClick = () => {
    setMenuOpen(false);
    onReset();
  };

  return (
    <Card
      variant={active ? "outlined" : "elevation"}
      sx={{
        position: "relative",
        color: (theme) => (active ? theme.palette.primary.main : undefined),
      }}
    >
      <CardActionArea onClick={() => onClick()}>
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

      <IconButton
        ref={menuAnchorRef}
        sx={{ position: "absolute", right: 0, top: 0 }}
        onClick={() => setMenuOpen(true)}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={menuOpen}
        anchorEl={menuAnchorRef.current}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem onClick={() => resetClick()}>
          <ListItemIcon>
            <Remove />
          </ListItemIcon>
          <ListItemText>Factory Reset</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => deleteClick()}>
          <ListItemIcon>
            <Remove />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};
