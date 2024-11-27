import { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import { BridgeCard } from "./BridgeCard.tsx";
import Grid from "@mui/material/Grid2";

export interface BridgeListProps {
  bridges: BridgeDataWithMetadata[];
  onSelect: (bridge: BridgeDataWithMetadata) => void;
  selectedId?: string;
  onDelete: (bridge: BridgeDataWithMetadata) => void;
  onReset: (bridge: BridgeDataWithMetadata) => void;
}

export const BridgeList = ({
  bridges,
  onDelete,
  onReset,
  onSelect,
  selectedId,
}: BridgeListProps) => {
  return (
    <Grid container spacing={2}>
      {bridges.map((bridge) => (
        <Grid key={bridge.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <BridgeCard
            bridge={bridge}
            active={bridge.id === selectedId}
            onClick={() => onSelect(bridge)}
            onDelete={() => onDelete(bridge)}
            onReset={() => onReset(bridge)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
