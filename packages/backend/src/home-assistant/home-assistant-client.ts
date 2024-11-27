import {
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
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
    }).catch((reason) => {
      throw this.parseError(reason);
    });
  }

  async [Symbol.asyncDispose]() {
    this.connection?.close();
  }

  private parseError(reason: unknown): Error {
    if (reason === ERR_CANNOT_CONNECT) {
      return new Error(
        `Unable to connect to home assistant with url: ${this.props.url}`,
      );
    } else if (reason === ERR_INVALID_AUTH) {
      return new Error(
        "Authentication failed while connecting to home assistant",
      );
    } else {
      return new Error(`Unable to connect to home assistant: ${reason}`);
    }
  }
}
