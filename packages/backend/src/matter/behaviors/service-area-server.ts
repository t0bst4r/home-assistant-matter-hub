import { ServiceAreaBaseServer as Base } from "@matter/main/behaviors";
import { ServiceArea } from "@matter/main/clusters";
import { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { MaybePromise } from "@matter/general";

export interface ServiceAreaServerConfig {
  getServiceAreas: ValueGetter<Promise<ServiceArea.Area[]>>;
  getCurrentServiceArea: ValueGetter<Promise<number | null | undefined>>;

  selectAreas: ValueSetter<number[]>;
  getMaps: ValueGetter<Promise<ServiceArea.Map[]>>;
}

class ServiceAreaServerBase extends Base {
  declare state: ServiceAreaServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    await this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update, {offline: true});
    await super.initialize();
  }

  private async update(entity: HomeAssistantEntityInformation) {
    const statePatchObject: Partial<ServiceAreaServerBase.State> = {
      supportedAreas: await this.state.config.getServiceAreas(
        entity.state,
        this.agent
      ),
      supportedMaps: await this.state.config.getMaps(entity.state, this.agent),
      currentArea: null,
      estimatedEndTime: null
    }

    const isRunning = false;

    if (isRunning) {
      statePatchObject.currentArea = await this.state.config.getCurrentServiceArea(entity.state, this.agent);
    }

    applyPatchState(this.state, statePatchObject);
  }

  override async selectAreas({
    newAreas,
  }: ServiceArea.SelectAreasRequest): Promise<ServiceArea.SelectAreasResponse> {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);

    await homeAssistant.callAction(
      this.state.config.selectAreas(newAreas, this.agent)
    );

    return {
      status: ServiceArea.SelectAreasStatus.Success,
      statusText: "Selected areas successfully",
    };
  }

  override skipArea(request: ServiceArea.SkipAreaRequest): MaybePromise<ServiceArea.SkipAreaResponse> {
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
  return ServiceAreaServerBase.withFeatures(ServiceArea.Feature.Maps).set({
    config,
  });
}
