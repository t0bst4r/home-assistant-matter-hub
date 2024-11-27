import express from "express";
import { matterApi } from "./matter-api.js";
import * as http from "node:http";
import { accessLogger } from "./access-log.js";
import { webUi } from "./web-ui.js";
import { createLogger } from "../logging/create-logger.js";
import { Environment, Environmental } from "@matter/main";
import { BridgeService } from "../matter/bridge-service.js";
import { register } from "../environment/register.js";

export interface WebApiProps {
  readonly port: number;
  readonly webUiDist?: string;
}

export class WebApi implements Environmental.Service {
  readonly construction: Promise<void>;
  private readonly log = createLogger("WebApi");
  private readonly accessLogger = accessLogger(
    createLogger(`WebApi / Access Log`),
  );

  private app!: express.Application;
  private server!: http.Server;

  constructor(
    private readonly environment: Environment,
    private readonly props: WebApiProps,
  ) {
    register(environment, WebApi, this);
    this.construction = this.initialize();
  }

  private async initialize() {
    const bridgeService = await this.environment.load(BridgeService);

    const api = express.Router();
    api.use(express.json()).use("/matter", matterApi(bridgeService));

    this.app = express()
      .use(this.accessLogger)
      .use("/api", api)
      .use(webUi(this.props.webUiDist));

    this.server = await new Promise((resolve) => {
      const server = this.app.listen(this.props.port, () => {
        this.log.info(
          "HTTP server (API %s) listening on port %s",
          this.props.webUiDist ? "& Web App" : "only",
          this.props.port,
        );
        resolve(server);
      });
    });
  }

  async [Symbol.asyncDispose]() {
    await new Promise<void>((resolve, reject) => {
      this.server?.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
