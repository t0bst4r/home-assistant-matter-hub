import { OnOffServer } from "../../../../behaviors/on-off-server.js";

export const LightOnOffServer = OnOffServer({
  turnOn: () => ({
    action: "light.turn_on",
  }),
  turnOff: () => ({
    action: "light.turn_off",
  }),
  isOn: (e) => e.state === "on",
}).with("Lighting");
