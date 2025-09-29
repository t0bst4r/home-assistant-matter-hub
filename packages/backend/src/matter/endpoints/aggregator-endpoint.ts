import { Endpoint } from "@matter/main";
import { AggregatorEndpoint as AggregatorEndpointType } from "@matter/main/endpoints";

export class AggregatorEndpoint extends Endpoint {
  constructor(id: string) {
    super(AggregatorEndpointType, { id });
  }
}
