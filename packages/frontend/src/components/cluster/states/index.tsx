import {
  BooleanStateClusterState,
  ClusterId,
  ColorControlClusterState,
  DoorLockClusterState,
  FanControlClusterState,
  LevelControlClusterState,
  MediaInputClusterState,
  OccupancySensingClusterState,
  OnOffClusterState,
  RelativeHumidityMeasurementClusterState,
  RvcOperationalStateClusterState,
  RvcRunModeClusterState,
  TemperatureMeasurementClusterState,
  ThermostatClusterState,
  WindowCoveringClusterState,
} from "@home-assistant-matter-hub/common";
import { FC } from "react";
import { OnOffState } from "./OnOffState.tsx";
import { ColorControlState } from "./ColorControlState.tsx";
import { LevelControlState } from "./LevelControlState.tsx";
import { DoorLockState } from "./DoorLockState.tsx";
import { WindowCoveringState } from "./WindowCoveringState.tsx";
import { TemperatureMeasurementState } from "./TemperatureMeasurementState.tsx";
import { OccupancySensingState } from "./OccupancySensingState.tsx";
import { BooleanState } from "./BooleanState.tsx";
import { RelativeHumidityMeasurementState } from "./RelativeHumidityMeasurementState.tsx";
import { ThermostatState } from "./ThermostatState.tsx";
import { FanControlState } from "./FanControlState.tsx";
import { MediaInputState } from "./MediaInputState.tsx";
import { RvcRunModeState } from "./RvcRunModeState.tsx";
import { RvcOperationalState } from "./RvcOperationalState.tsx";

export const clusterRenderers: Record<
  ClusterId,
  FC<{ state: unknown; clusterId: string }> | null | undefined
> = {
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
  [ClusterId.fanControl]: ({ state }) => (
    <FanControlState state={state as FanControlClusterState} />
  ),
  [ClusterId.mediaInput]: ({ state }) => (
    <MediaInputState state={state as MediaInputClusterState} />
  ),
  [ClusterId.rvcRunMode]: ({ state }) => (
    <RvcRunModeState state={state as RvcRunModeClusterState} />
  ),
  [ClusterId.rvcOperationalState]: ({ state }) => (
    <RvcOperationalState state={state as RvcOperationalStateClusterState} />
  ),
  [ClusterId.homeAssistantEntity]: null,
  [ClusterId.descriptor]: null,
  [ClusterId.bridgedDeviceBasicInformation]: null,
  [ClusterId.identify]: null,
  [ClusterId.groups]: null,
};
