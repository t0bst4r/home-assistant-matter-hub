import {
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
  getConfig,
} from "home-assistant-js-websocket";
import { Environment } from "@matter/main";
import { register, Service } from "../environment/register.js";
import { Logger } from "@matter/general";
import { LoggerService } from "../environment/logger.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
}

export class HomeAssistantClient implements Service {
  private readonly log: Logger;
  readonly construction: Promise<void>;
  public connection!: Connection;
  private disposed = false;

  constructor(
    environment: Environment,
    private readonly props: HomeAssistantClientProps,
  ) {
    register(environment, HomeAssistantClient, this);
    this.log = environment.get(LoggerService).get("HomeAssistantClient");
    this.construction = this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.disposed) {
      return;
    }
    try {
      this.connection?.close();
      this.connection = await createConnection({
        auth: createLongLivedTokenAuth(
          this.props.url.replace(/\/$/, ""),
          this.props.accessToken,
        ),
      });
      await this.waitForHomeAssistantToBeUpAndRunning();
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

  private async waitForHomeAssistantToBeUpAndRunning(): Promise<void> {
    this.log.info("Waiting for Home Assistant to be up and running");

    const getState = async () => {
      const s = await getConfig(this.connection).then((config) => config.state);
      this.log.debug(
        `Got an update from Home Assistant. System state is '${s}'.`,
      );
      return s;
    };
    let state = "NOT_RUNNING";
    while (state !== "RUNNING") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      state = await getState();
    }
  }

  async [Symbol.asyncDispose]() {
    this.disposed = true;
    this.connection?.close();
  }
}
