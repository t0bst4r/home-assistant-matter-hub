import {
  Connection,
  createConnection,
  createLongLivedTokenAuth,
} from "home-assistant-js-websocket";
import { Environment, Environmental } from "@matter/main";
import { register } from "../environment/register.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
}

export class HomeAssistantClient implements Environmental.Service {
  readonly construction: Promise<void>;
  public connection!: Connection;

  constructor(
    environment: Environment,
    private readonly props: HomeAssistantClientProps,
  ) {
    register(environment, HomeAssistantClient, this);
    this.construction = this.initialize();
  }

  private async initialize() {
    this.connection = await createConnection({
      auth: createLongLivedTokenAuth(
        this.props.url.replace(/\/$/, ""),
        this.props.accessToken,
      ),
    });
  }

  async [Symbol.asyncDispose]() {
    this.connection?.close();
  }
}
