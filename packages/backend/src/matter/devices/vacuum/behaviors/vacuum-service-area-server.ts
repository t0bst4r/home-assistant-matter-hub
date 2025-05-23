import type { ServiceArea } from "@matter/main/clusters/service-area";
import {
  type CleanInfo,
  ServiceAreaServer,
} from "../../../behaviors/service-area-server.js";
import { HomeAssistantEntityBehavior } from "../../../custom-behaviors/home-assistant-entity-behavior.js";

export const VacuumServiceAreaServer = ServiceAreaServer({
  getServiceAreas: async (entity, agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const result = await homeAssistant.callQueryAction<{
      response: Record<
        string,
        { rooms: Record<number, string>; map_id: number }
      >;
    }>({ action: "tplink.get_rooms", data: { map_id: -1 } });
    const { rooms, map_id } = result.response[entity.entity_id];

    return Object.entries(rooms).map(([id, name]) => ({
      areaId: Number.parseInt(id),
      mapId: map_id,
      areaInfo: {
        landmarkInfo: null,
        locationInfo: {
          areaType: null,
          floorNumber: null,
          locationName: name,
        },
      },
    }));
  },

  getCurrentServiceArea: async (entity, agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    return await homeAssistant.callQueryAction<number>({
      action: "tplink.get_current_room",
    });
  },

  getMaps: async (entity, agent): Promise<ServiceArea.Map[]> => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const result = await homeAssistant.callQueryAction<{
      response: Record<
        string,
        {
          maps: {
            id: number;
            name: string;
          }[];
        }
      >;
    }>({ action: "tplink.get_maps" });

    const response = result.response[entity.entity_id];

    return response.maps.map((map) => ({
      mapId: map.id,
      name: map.name,
    }));
  },

  getCurrentRoom: async (entity, agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const result = await homeAssistant.callQueryAction<{
      response: Record<string, { current_room: number }>;
    }>({
      action: "tplink.get_current_room",
    });

    const response = result.response[entity.entity_id];

    return response.current_room;
  },

  getCleanInfo: async (entity, agent) => {
    const homeAssistant = agent.get(HomeAssistantEntityBehavior);
    const result = await homeAssistant.callQueryAction<{
      response: Record<string, { getCleanInfo: CleanInfo }>;
    }>({
      action: "tplink.custom_query",
      data: { query: "getCleanInfo" },
    });

    return result.response[entity.entity_id].getCleanInfo;
  },
});
