import Box from "@mui/material/Box";
import { OnOffState } from "./states/OnOffState.tsx";
import { FC, useEffect } from "react";
import { Tooltip } from "@mui/material";
import { ColorControlState } from "./states/ColorControlState.tsx";
import { LevelControlState } from "./states/LevelControlState.tsx";
import { DoorLockState } from "./states/DoorLockState.tsx";
import { WindowCoveringState } from "./states/WindowCoveringState.tsx";
import { TemperatureMeasurementState } from "./states/TemperatureMeasurementState.tsx";
import { OccupancySensingState } from "./states/OccupancySensingState.tsx";
import {
  BooleanStateClusterState,
  ClusterId,
  ColorControlClusterState,
  DoorLockClusterState,
  LevelControlClusterState,
  OccupancySensingClusterState,
  OnOffClusterState,
  RelativeHumidityMeasurementClusterState,
  TemperatureMeasurementClusterState,
  ThermostatClusterState,
  WindowCoveringClusterState,
} from "@home-assistant-matter-hub/common";
import { BooleanState } from "./states/BooleanState.tsx";
import { RelativeHumidityMeasurementState } from "./states/RelativeHumidityMeasurementState.tsx";
import { ThermostatState } from "./states/ThermostatState.tsx";

export interface ClusterStateProps {
  clusterId: ClusterId | string;
  state: unknown;
}

const renderer: Record<ClusterId, FC<{ state: unknown }> | null> = {
  [ClusterId.onOff]: ({ state }) => (
    <OnOffState state={state as OnOffClusterState} />
  ),
  [ClusterId.colorControl]: ({ state }) => (
    <ColorControlState state={state as ColorControlClusterState} />
  ),
  [ClusterId.levelControl]: ({ state }) => (
    <LevelControlState state={state as LevelControlClusterState} />
  ),
  [ClusterId.doorLock]: ({ state }) => (
    <DoorLockState state={state as DoorLockClusterState} />
  ),
  [ClusterId.windowCovering]: ({ state }) => (
    <WindowCoveringState state={state as WindowCoveringClusterState} />
  ),
  [ClusterId.temperatureMeasurement]: ({ state }) => (
    <TemperatureMeasurementState
      state={state as TemperatureMeasurementClusterState}
    />
  ),
  [ClusterId.occupancySensing]: ({ state }) => (
    <OccupancySensingState state={state as OccupancySensingClusterState} />
  ),
  [ClusterId.booleanState]: ({ state }) => (
    <BooleanState state={state as BooleanStateClusterState} />
  ),
  [ClusterId.relativeHumidityMeasurement]: ({ state }) => (
    <RelativeHumidityMeasurementState
      state={state as RelativeHumidityMeasurementClusterState}
    />
  ),
  [ClusterId.thermostat]: ({ state }) => (
    <ThermostatState state={state as ThermostatClusterState} />
  ),
  [ClusterId.descriptor]: null,
  [ClusterId.bridgedDeviceBasicInformation]: null,
  [ClusterId.identify]: null,
  [ClusterId.groups]: null,
};

const ErrorRenderer = (props: { clusterId: string; state: unknown }) => {
  useEffect(() => {
    console.warn(`No supported State Renderer for '${props.clusterId}'`);
    console.debug(props.state);
  }, [props]);
  return undefined;
};

export const ClusterState = ({ clusterId, state }: ClusterStateProps) => {
  const Component = renderer[clusterId as ClusterId];
  if (Component === undefined) {
    return <ErrorRenderer clusterId={clusterId} state={state} />;
  } else if (Component === null) {
    return <></>;
  } else {
    return (
      <Tooltip title={clusterId} arrow>
        <Box display="flex" alignItems="center">
          <Component state={state} />
        </Box>
      </Tooltip>
    );
  }
};
