import type { MediaPlayerDeviceAttributes } from "@home-assistant-matter-hub/common";
import { MediaInputServer } from "../../../../behaviors/media-input-server.js";

export const MediaPlayerMediaInputServer = MediaInputServer({
  getCurrentSource: (entity) =>
    (entity.attributes as MediaPlayerDeviceAttributes).source,
  getSourceList: (entity) =>
    (entity.attributes as MediaPlayerDeviceAttributes).source_list,
  selectSource: (source) => ({
    action: "media_player.select_source",
    data: { source },
  }),
});
