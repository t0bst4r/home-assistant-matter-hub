import {
  HomeAssistantEntityRegistry,
  HomeAssistantEntityRegistryWithInitialState,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Connection, getStates } from "home-assistant-js-websocket";
import _, { Dictionary } from "lodash";

export async function getRegistry(
  connection: Connection,
): Promise<Dictionary<HomeAssistantEntityRegistryWithInitialState>> {
  const registry = _.keyBy(
    await connection.sendMessagePromise<HomeAssistantEntityRegistry[]>({
      type: "config/entity_registry/list",
    }),
    (r) => r.entity_id,
  );
  const states: Dictionary<HomeAssistantEntityState> = _.keyBy(
    await getStates(connection),
    (e) => e.entity_id,
  );
  return _.mapValues(registry, (r) => ({
    ...r,
    initialState: states[r.entity_id],
  }));
}
