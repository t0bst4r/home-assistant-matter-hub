import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { MediaInputServer as Base } from "@matter/main/behaviors";
import { MediaInput } from "@matter/main/clusters";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export interface MediaInputServerConfig {
  getCurrentSource: ValueGetter<string | undefined>;
  getSourceList: ValueGetter<string[] | undefined>;

  selectSource: ValueSetter<string>;
}

class MediaInputServerBase extends Base {
  declare state: MediaInputServerBase.State;

  override async initialize() {
    super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    const config = this.state.config;
    let source_idx = 0;
    const sourceList = config.getSourceList(entity.state, this.agent)?.sort();
    const inputList = sourceList?.map((source) => ({
      index: source_idx++,
      inputType: MediaInput.InputType.Other,
      name: source,
      description: source,
    }));
    const currentSource = config.getCurrentSource(entity.state, this.agent);
    let currentInput = sourceList?.indexOf(currentSource ?? "");
    if (currentInput === -1 || currentInput == null) {
      currentInput = 0;
    }
    applyPatchState(this.state, {
      inputList,
      currentInput,
    });
  }

  override async selectInput(request: MediaInput.SelectInputRequest) {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);
    const target = this.state.inputList[request.index];
    await homeAssistant.callAction(
      this.state.config.selectSource(target.name, this.agent),
    );
  }

  override async showInputStatus() {}

  override async hideInputStatus() {}
}

namespace MediaInputServerBase {
  export class State extends Base.State {
    config!: MediaInputServerConfig;
  }
}

export function MediaInputServer(config: MediaInputServerConfig) {
  return MediaInputServerBase.set({ config });
}
