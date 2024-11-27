import { Environment } from "@matter/main";
import { MdnsService } from "@matter/main/protocol";

export function mdns(
  environment: Environment,
  mdnsNetworkInterface: string | undefined,
) {
  new MdnsService(environment, {
    ipv4: true,
    networkInterface: mdnsNetworkInterface,
  });
}
