import { OnOffServer } from "../../../../behaviors/on-off-server.js";

export const FanOnOffServer = OnOffServer({
  turnOn: () => ({ action: "fan.turn_on" }),
  turnOff: () => ({ action: "fan.turn_off" }),
}).with("Lighting");
