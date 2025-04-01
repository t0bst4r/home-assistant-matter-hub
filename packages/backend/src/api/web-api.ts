import type * as http from "node:http";
import type { Environment } from "@matter/main";
import express from "express";
import basicAuth from "express-basic-auth";
import AccessControl from "express-ip-access-control";
import nocache from "nocache";
import { type BetterLogger, LoggerService } from "../environment/logger.js";
import { type Service, register } from "../environment/register.js";
import { accessLogger } from "./access-log.js";
import { matterApi } from "./matter-api.js";
import { supportIngress, supportProxyLocation } from "./proxy-support.js";
import { webUi } from "./web-ui.js";

export interface WebApiProps {
  readonly port: number;
  readonly whitelist: string[] | undefined;
  readonly webUiDist?: string;
  readonly auth?: {
    username: string;
    password: string;
  };
}

export class WebApi implements Service {
  readonly construction: Promise<void>;
  private readonly log: BetterLogger;
  private readonly accessLogger: express.RequestHandler;

  private app!: express.Application;
  private server!: http.Server;

  constructor(
    private readonly environment: Environment,
    private readonly props: WebApiProps,
  ) {
    register(environment, WebApi, this);
    const loggerService = environment.get(LoggerService);
    this.log = loggerService.get("WebApi");
    this.accessLogger = accessLogger(loggerService.get("WebApi / Access Log"));
    this.construction = this.initialize();
  }

  private async initialize() {
    const api = express.Router();
    api
      .use(express.json())
      .use(nocache())
      .use("/matter", matterApi(this.environment));

    const middlewares: express.Handler[] = [
      this.accessLogger,
      supportIngress,
      supportProxyLocation,
    ];

    if (this.props.auth) {
      middlewares.push(
        basicAuth({
          users: { [this.props.auth.username]: this.props.auth.password },
          challenge: true,
          realm: "Home Assistant Matter Hub",
        }),
      );
      this.log.info("Basic authentication enabled");
    }
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
          `HTTP server (API ${this.props.webUiDist ? "& Web App" : "only"}) listening on port ${this.props.port}`,
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
