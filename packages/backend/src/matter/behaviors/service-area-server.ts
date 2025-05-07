import { ServiceAreaBaseServer as Base } from "@matter/main/behaviors";
import { ServiceArea } from "@matter/main/clusters";
import { ValueGetter, ValueSetter } from "./utils/cluster-config.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";

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
    console.log(this.state);
    // try {
    //       // @ts-ignore
    //   delete this.state.estimatedEndTime;
    // } catch {}
    // console.log(this.state);

    applyPatchState(this.state, {
      supportedAreas: await this.state.config.getServiceAreas(
        entity.state,
        this.agent
      ),
      currentArea: null,
      estimatedEndTime: null,
      // supportedMaps: await this.state.config.getMaps(entity.state, this.agent),
    });

    // this.state
    // applyPatchState(this.state, {
    //   // currentArea: await this.state.config.getCurrentServiceArea(entity.state, this.agent),
    //   supportedAreas: await this.state.config.getServiceAreas(entity.state, this.agent),
    //   supportedMaps: await this.state.config.getMaps(entity.state, this.agent),
    //   // currentArea: null,
    //   // selectedAreas: [1],
    //   // estimatedEndTime: null,
    // });
    // Object.assign(this.state, {
    //   supportedAreas: await this.state.config.getServiceAreas(entity.state, this.agent),
    //   supportedMaps: await this.state.config.getMaps(entity.state, this.agent)
    // });
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
