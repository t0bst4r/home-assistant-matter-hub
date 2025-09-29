import type { Environment } from "@matter/main";
import { MdnsService } from "@matter/main/protocol";

export interface MdnsOptions {
  ipv4: boolean;
  networkInterface?: string;
}

export function mdns(env: Environment, options: MdnsOptions) {
  new MdnsService(env, {
    ipv4: options.ipv4,
    networkInterface: options.networkInterface,
  });
}
