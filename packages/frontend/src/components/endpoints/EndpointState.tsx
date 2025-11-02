import {
  ClusterId,
  type EndpointData,
} from "@home-assistant-matter-hub/common";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

export interface EndpointStateProps {
  endpoint: EndpointData;
}

const ignoredBehaviors = [ClusterId.homeAssistantEntity];

export const EndpointState = (props: EndpointStateProps) => {
  const allBehaviors = useMemo(
    () =>
      Object.keys(
        props.endpoint.state,
      ) as (keyof typeof props.endpoint.state)[],
    [props.endpoint],
  );
  const behaviors = useMemo(
    () => allBehaviors.filter((it) => !ignoredBehaviors.includes(it)).sort(),
    [allBehaviors],
  );
  const metadata = useMemo(
    () => ({
      "Endpoint ID": props.endpoint.id.local,
      "Endpoint Type": `${props.endpoint.type.name} (${props.endpoint.type.id})`,
      "Endpoint Number": props.endpoint.endpoint,
      "# of Child Endpoints": props.endpoint.parts.length,
    }),
    [props.endpoint],
  );

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="span">About this endpoint</Typography>
          <ObjectTable value={metadata} hideHead></ObjectTable>
        </Stack>
      </Paper>

      {behaviors.map((behavior) => (
        <Accordion key={behavior}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
          >
            <Typography component="span">
              Behavior: <strong>{behavior}</strong>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ObjectTable value={props.endpoint.state[behavior]} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const ObjectTable = <T extends object>(props: {
  value: T;
  hideHead?: boolean;
}) => {
  const properties = useMemo(
    () => Object.keys(props.value) as (keyof T & string)[],
    [props.value],
  );
  return (
    <TableContainer>
      <Table size="small">
        {!props.hideHead && (
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property}>
              <TableCell>{property}</TableCell>
              <TableCell>
                <RenderProperty property={props.value[property]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RenderProperty = (props: { property: unknown }) => {
  const value = useMemo(() => {
    if (typeof props.property === "string") {
      return props.property.toString();
    } else if (typeof props.property === "number") {
      return props.property.toString();
    } else if (typeof props.property === "boolean") {
      return String(props.property);
    } else {
      return JSON.stringify(props.property);
    }
  }, [props.property]);
  return (
    <Typography fontFamily="monospace" fontSize="0.9em">
      {value}
    </Typography>
  );
};
