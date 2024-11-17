// https://www.home-assistant.io/integrations/media_player/
export enum MediaPlayerDeviceClass {
  Tv = "tv",
  Speaker = "speaker",
  Receiver = "receiver",
}

export interface SpeakerDeviceAttributes {
  volume_level?: number;
  device_class?: MediaPlayerDeviceClass;
}
