import { OnOffConfig, OnOffServer } from "../../behaviors/on-off-server.js";

const onOffConfig: OnOffConfig = {
  turnOn: {
    action: "light.turn_on",
  },
  turnOff: {
    action: "light.turn_off",
  },
  isOn: (e) => e.state === "on",
};

export const LightOnOffServer = OnOffServer.with("Lighting").set({
  config: onOffConfig,
});
