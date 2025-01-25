import {
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
} from "home-assistant-js-websocket";
import { Environment } from "@matter/main";
import { register, Service } from "../environment/register.js";
import { Logger } from "winston";
import { createLogger } from "../logging/create-logger.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
}

export class HomeAssistantClient implements Service {
  private readonly log: Logger;
  readonly construction: Promise<void>;
  public connection!: Connection;

  constructor(
    environment: Environment,
    private readonly props: HomeAssistantClientProps,
  ) {
    this.log = createLogger("HomeAssistantClient");
    register(environment, HomeAssistantClient, this);
    this.construction = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.connection?.close();
      this.connection = await createConnection({
        auth: createLongLivedTokenAuth(
          this.props.url.replace(/\/$/, ""),
          this.props.accessToken,
        ),
      });
    } catch (reason: unknown) {
      return this.handleInitializationError(reason);
    }
  }

  private async handleInitializationError(reason: unknown): Promise<void> {
    if (reason === ERR_CANNOT_CONNECT) {
      this.log.error(
        `Unable to connect to home assistant with url: ${this.props.url}. Retrying in 5 seconds...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return this.initialize();
    } else if (reason === ERR_INVALID_AUTH) {
      throw new Error(
        "Authentication failed while connecting to home assistant",
      );
    } else {
      throw new Error(`Unable to connect to home assistant: ${reason}`);
    }
  }

  async [Symbol.asyncDispose]() {
    this.connection?.close();
  }
}
