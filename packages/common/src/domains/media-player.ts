// https://www.home-assistant.io/integrations/media_player/
export enum MediaPlayerDeviceClass {
  Tv = "tv",
  Speaker = "speaker",
  Receiver = "receiver",
}

export interface MediaPlayerDeviceAttributes {
  device_class?: MediaPlayerDeviceClass;
  volume_level?: number;
  is_volume_muted?: boolean;
}
