import {
  type BooleanStateClusterState,
  ClusterId,
  type ColorControlClusterState,
  type DoorLockClusterState,
  type FanControlClusterState,
  type LevelControlClusterState,
  type MediaInputClusterState,
  type OccupancySensingClusterState,
  type OnOffClusterState,
  type RelativeHumidityMeasurementClusterState,
  type RvcOperationalStateClusterState,
  type RvcRunModeClusterState,
  type ServiceAreaClusterState,
  type TemperatureMeasurementClusterState,
  type ThermostatClusterState,
  type WindowCoveringClusterState,
} from "@home-assistant-matter-hub/common";
import type { FC } from "react";
import { BooleanState } from "./BooleanState.tsx";
import { ColorControlState } from "./ColorControlState.tsx";
import { DoorLockState } from "./DoorLockState.tsx";
import { FanControlState } from "./FanControlState.tsx";
import { LevelControlState } from "./LevelControlState.tsx";
import { MediaInputState } from "./MediaInputState.tsx";
import { OccupancySensingState } from "./OccupancySensingState.tsx";
import { OnOffState } from "./OnOffState.tsx";
import { RelativeHumidityMeasurementState } from "./RelativeHumidityMeasurementState.tsx";
import { RvcCleanModeState } from "./RvcCleanModeState.tsx";
import { RvcOperationalState } from "./RvcOperationalState.tsx";
import { RvcRunModeState } from "./RvcRunModeState.tsx";
import { ServiceAreaState } from "./ServiceAreaState.tsx";
import { TemperatureMeasurementState } from "./TemperatureMeasurementState.tsx";
import { ThermostatState } from "./ThermostatState.tsx";
import { WindowCoveringState } from "./WindowCoveringState.tsx";

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
  [ClusterId.rvcCleanMode]: ({ state }) => (
    <RvcCleanModeState state={state as RvcCleanModeState} />
  ),
  [ClusterId.serviceArea]: ({ state }) => (
    <ServiceAreaState state={state as ServiceAreaClusterState} />
  ),
  [ClusterId.homeAssistantEntity]: null,
  [ClusterId.descriptor]: null,
  [ClusterId.bridgedDeviceBasicInformation]: null,
  [ClusterId.identify]: null,
  [ClusterId.groups]: null,
};
