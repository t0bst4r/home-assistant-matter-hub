import express from "express";
import { matterApi } from "./matter-api.js";
import * as http from "node:http";
import { accessLogger } from "./access-log.js";
import { webUi } from "./web-ui.js";
import { createLogger } from "../logging/create-logger.js";
import { Environment } from "@matter/main";
import { BridgeService } from "../matter/bridge-service.js";
import { register, Service } from "../environment/register.js";
import { supportIngress, supportProxyLocation } from "./proxy-support.js";
import AccessControl from "express-ip-access-control";
import nocache from "nocache";

export interface WebApiProps {
  readonly port: number;
  readonly whitelist: string[] | undefined;
  readonly webUiDist?: string;
}

export class WebApi implements Service {
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
    api
      .use(express.json())
      .use(nocache())
      .use("/matter", matterApi(bridgeService));

    const middlewares: express.Handler[] = [
      this.accessLogger,
      supportIngress,
      supportProxyLocation,
    ];
    if (this.props.whitelist && this.props.whitelist.length > 0) {
      middlewares.push(
        AccessControl({
          log: (clientIp, access) => {
            this.log.silly(
              `Client ${clientIp} was ${access ? "granted" : "denied"}`,
            );
          },
          mode: "allow",
          allows: this.props.whitelist,
        }),
      );
    }

    this.app = express()
      .use(...middlewares)
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
