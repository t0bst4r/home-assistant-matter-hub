import { OnOffServer } from "../../../../behaviors/on-off-server.js";

export const ClimateOnOffServer = OnOffServer({
  turnOn: () => ({ action: "climate.turn_on" }),
  turnOff: () => ({ action: "climate.turn_off" }),
}).with("Lighting");
