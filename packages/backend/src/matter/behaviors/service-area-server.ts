import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import type { MaybePromise } from "@matter/general";
import { ServiceAreaBaseServer as Base } from "@matter/main/behaviors";
import { ServiceArea } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { type ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export interface CleanInfo {
  clean_status: number; // TODO: this is surely an enum of some sort
  is_working: boolean;
  is_mapping: boolean;
  is_relocating: boolean;
}

export interface ServiceAreaServerConfig {
  getServiceAreas: ValueGetter<Promise<ServiceArea.Area[]>>;
  getCurrentServiceArea: ValueGetter<Promise<number | null | undefined>>;

  getMaps: ValueGetter<Promise<ServiceArea.Map[]>>;
  getCurrentRoom: ValueGetter<Promise<number | null | undefined>>;
  getCleanInfo: ValueGetter<Promise<CleanInfo>>;
}

class ServiceAreaServerBase extends Base {
  declare state: ServiceAreaServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    await this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update, { offline: true });
    await super.initialize();
  }

  private async update(entity: HomeAssistantEntityInformation) {
    const statePatchObject: Partial<ServiceAreaServerBase.State> = {
      supportedAreas: await this.state.config.getServiceAreas(
        entity.state,
        this.agent,
      ),
      supportedMaps: await this.state.config.getMaps(entity.state, this.agent),
      selectedAreas: this.state.selectedAreas,
      currentArea: null,
      estimatedEndTime: null,
    };

    const currentRoom = await this.state.config.getCurrentRoom(
      entity.state,
      this.agent,
    );
    const cleanInfo = await this.state.config.getCleanInfo(
      entity.state,
      this.agent,
    );

    if (typeof currentRoom === "number") {
      // TODO: this should be an array of areas
      statePatchObject.progress = [
        {
          areaId: currentRoom,
          status: cleanInfo.is_relocating
            ? ServiceArea.OperationalStatus.Skipped
            : ServiceArea.OperationalStatus.Operating,
          estimatedTime: null,
          totalOperationalTime: null,
        },
      ];

      statePatchObject.currentArea = currentRoom;
      // TODO: compute this
      statePatchObject.estimatedEndTime = null;
    }

    applyPatchState(this.state, statePatchObject);
  }

  override async selectAreas({
    newAreas,
  }: ServiceArea.SelectAreasRequest): Promise<ServiceArea.SelectAreasResponse> {
    applyPatchState(this.state, { selectedAreas: newAreas });

    return {
      status: ServiceArea.SelectAreasStatus.Success,
      statusText: "Selected areas successfully",
    };
  }

  override skipArea(
    request: ServiceArea.SkipAreaRequest,
  ): MaybePromise<ServiceArea.SkipAreaResponse> {
    return super.skipArea(request);
  }

  override removeSupportedAreasEntry(areaId: number): void {
    super.removeSupportedAreasEntry(areaId);
  }

  override removeSupportedMapsEntry(mapId: number): void {
    super.removeSupportedMapsEntry(mapId);
  }
}

namespace ServiceAreaServerBase {
  export class State extends Base.State {
    config!: ServiceAreaServerConfig;
  }
}

export function ServiceAreaServer(config: ServiceAreaServerConfig) {
  return ServiceAreaServerBase.withFeatures(
    ServiceArea.Feature.Maps,
    ServiceArea.Feature.ProgressReporting,
  ).set({
    config,
  });
}
