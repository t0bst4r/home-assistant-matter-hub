import { HomeAssistantEntityRegistry } from "@home-assistant-matter-hub/common";
import { Connection } from "home-assistant-js-websocket";

export async function getRegistry(
  connection: Connection,
): Promise<HomeAssistantEntityRegistry[]> {
  return connection.sendMessagePromise<HomeAssistantEntityRegistry[]>({
    type: "config/entity_registry/list",
  });
}
