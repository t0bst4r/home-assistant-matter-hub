import fs from "node:fs";
import type { Argv } from "yargs";
import type { StartOptions } from "./start-options.js";

export function startOptionsBuilder(yargs: Argv): Argv<StartOptions> {
  return yargs
    .version(false)
    .config(
      "config",
      'Provide the path to a configuration JSON file, which can include all the other command options. You can use kebabcase ("log-level") or camelcase ("logLevel").',
      (configPath) => {
        if (configPath.trim() === "") {
          return {};
        }
        if (!fs.existsSync(configPath)) {
          throw new Error(`Config file '${configPath}' does not exist!`);
        }
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      },
    )
    .option("log-level", {
      type: "string",
      choices: ["silly", "debug", "info", "notice", "warn", "error", "fatal"],
      default: "info",
    })
    .option("disable-log-colors", {
      type: "boolean",
      default: false,
    })
    .option("storage-location", {
      type: "string",
      description:
        "Path to a directory where the application should store its data. Defaults to $HOME/.home-assistant-matter-hub",
    })
    .option("http-port", {
      alias: "web-port",
      type: "number",
      description:
        "Port used by the web application. 'http-port' is recommended, 'web-port' is deprecated and will be removed in the future.",
      default: 8482,
    })
    .option("http-ip-whitelist", {
      type: "array",
      description:
        "Only allow the specified IPv4, IPv6 or CIDR. You can specify this option multiple times. When configured via ENV variables, you can only specify ONE value. Defaults to allow every IP address.",
    })
    .option("mdns-network-interface", {
      type: "string",
      description: "Limit mDNS to this network interface",
    })
    .option("home-assistant-url", {
      type: "string",
      description: "The HTTP-URL of your Home Assistant URL",
    })
    .option("home-assistant-access-token", {
      type: "string",
      description: "A long-lived access token for your Home Assistant Instance",
    })
    .option("home-assistant-refresh-interval", {
      type: "number",
      description:
        "The refresh rate (in seconds) to detect new devices & entities or their configurations",
      default: 30,
    })
    .option("http-auth-username", {
      type: "string",
      description: "Username for HTTP basic authentication (optional)",
    })
    .option("http-auth-password", {
      type: "string",
      description: "Password for HTTP basic authentication (optional)",
    })
    .demandOption(["home-assistant-url", "home-assistant-access-token"]);
}
