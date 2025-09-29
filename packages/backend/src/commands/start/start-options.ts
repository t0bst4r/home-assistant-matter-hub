export interface StartOptions {
  "log-level": string;
  "http-port": number;
  "http-ip-whitelist": (string | number)[] | undefined;
  "disable-log-colors": boolean;
  "storage-location": string | undefined;
  "mdns-network-interface": string | undefined;
  "home-assistant-url": string;
  "home-assistant-access-token": string;
  "home-assistant-refresh-interval": number;
  "http-auth-username": string | undefined;
  "http-auth-password": string | undefined;
}
