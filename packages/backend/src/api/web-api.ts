import express from "express";
import type { BridgeService } from "../matter/bridge-service.js";
import { matterApi } from "./matter-api.js";
import * as http from "node:http";
import { accessLogger } from "./access-log.js";
import { webUi } from "./web-ui.js";
import type { Logger } from "winston";
import { ServiceBase } from "../utils/service.js";
import { createChildLogger } from "../logging/create-child-logger.js";

export interface WebApiProps {
  readonly logger: Logger;
  readonly bridgeService: BridgeService;
  readonly port: number;
  readonly webUiDist?: string;
}

export class WebApi extends ServiceBase {
  private readonly port: number;
  private readonly includesWebUi: boolean;

  private readonly app: express.Application;
  private server?: http.Server;

  constructor(props: WebApiProps) {
    super("WebApi", props.logger);

    const api = express.Router();
    api.use(express.json()).use("/matter", matterApi(props.bridgeService));

    let app = express()
      .use(accessLogger(createChildLogger(this.log, "WebApi / access-log")))
      .use("/api", api);
    if (props.webUiDist) {
      app = app.use(webUi(props.webUiDist));
    }
    this.app = app;
    this.port = props.port;
    this.includesWebUi = !!props.webUiDist;
  }

  async start() {
    this.server = await new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        this.log.info(
          "HTTP server (API %s) listening on port %s",
          this.includesWebUi ? "& Web App" : "only",
          this.port,
        );
        resolve(server);
      });
    });
  }

  async close() {
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
