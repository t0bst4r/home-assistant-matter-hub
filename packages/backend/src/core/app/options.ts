import { VendorId } from "@matter/main";
import type { ArgumentsCamelCase } from "yargs";
import type { WebApiProps } from "../../api/web-api.js";
import type { StartOptions } from "../../commands/start/start-options.js";
import type { BridgeServiceProps } from "../../services/bridges/bridge-service.js";
import type { HomeAssistantClientProps } from "../../services/home-assistant/home-assistant-client.js";
import type { LoggerServiceProps } from "./logger.js";
import type { MdnsOptions } from "./mdns.js";
import type { StorageOptions } from "./storage.js";

export type OptionsProps = ArgumentsCamelCase<StartOptions> & {
  webUiDist: string | undefined;
};

export class Options {
  constructor(private readonly startOptions: OptionsProps) {}

  get mdns(): MdnsOptions {
    return {
      ipv4: true,
      networkInterface: notEmpty(this.startOptions.mdnsNetworkInterface),
    };
  }

  get logging(): LoggerServiceProps {
    return {
      level: this.startOptions.logLevel,
      disableColors: this.startOptions.disableLogColors ?? false,
    };
  }

  get storage(): StorageOptions {
    return {
      location: notEmpty(this.startOptions.storageLocation),
    };
  }

  get homeAssistant(): HomeAssistantClientProps {
    return {
      url: this.startOptions.homeAssistantUrl,
      accessToken: this.startOptions.homeAssistantAccessToken,
      refreshInterval: this.startOptions.homeAssistantRefreshInterval,
    };
  }

  get webApi(): WebApiProps {
    const auth: WebApiProps["auth"] =
      this.startOptions.httpAuthUsername && this.startOptions.httpAuthPassword
        ? {
            username: this.startOptions.httpAuthUsername,
            password: this.startOptions.httpAuthPassword,
          }
        : undefined;
    return {
      port: this.startOptions.httpPort,
      whitelist: this.startOptions.httpIpWhitelist?.map((item) =>
        item.toString(),
      ),
      webUiDist: this.startOptions.webUiDist,
      auth,
    };
  }

  get bridgeService(): BridgeServiceProps {
    return {
      basicInformation: {
        vendorId: VendorId(0xfff1),
        vendorName: "t0bst4r",
        productId: 0x8000,
        productName: "MatterHub",
        productLabel: "Home Assistant Matter Hub",
        hardwareVersion: new Date().getFullYear(),
        softwareVersion: new Date().getFullYear(),
      },
    };
  }
}

function notEmpty(val: string | undefined | null): string | undefined {
  const value = val?.trim();
  if (value == null || value.length === 0) {
    return undefined;
  }
  return value;
}
