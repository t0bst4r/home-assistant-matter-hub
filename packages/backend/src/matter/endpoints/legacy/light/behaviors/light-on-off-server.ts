import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import { BridgeDataProvider } from "../../../../../services/bridges/bridge-data-provider.js";
import { OnOffServer } from "../../../../behaviors/on-off-server.js";

export const LightOnOffServer = OnOffServer({
  turnOn: () => ({
    action: "light.turn_on",
  }),
  turnOff: () => ({
    action: "light.turn_off",
  }),
  isOn: (e) => e.state === "on",
  turnOnDelayInMs: (_entity: HomeAssistantEntityState, agent: Agent) => {
    const { featureFlags } = agent.env.get(BridgeDataProvider);
    return featureFlags?.alexaLightOptimizations ? 200 : 0;
  },
}).with(["Lighting"]);
