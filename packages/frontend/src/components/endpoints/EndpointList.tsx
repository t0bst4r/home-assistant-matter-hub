import type { EndpointData } from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { EndpointState } from "./EndpointState.tsx";
import { EndpointTreeView } from "./EndpointTreeView.tsx";

export interface EndpointListProps {
  endpoint: EndpointData;
}

export const EndpointList = (props: EndpointListProps) => {
  const [selectedItem, setSelectedItem] = useState<EndpointData | undefined>(
    undefined,
  );
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Box>
          <Typography variant="h6" component="span">
            Endpoints
          </Typography>
        </Box>
        <EndpointTreeView
          endpoint={props.endpoint}
          onSelected={setSelectedItem}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {selectedItem && <EndpointState endpoint={selectedItem} />}
      </Grid>
    </Grid>
  );
};
