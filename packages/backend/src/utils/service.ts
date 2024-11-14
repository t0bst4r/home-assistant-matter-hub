import { Logger } from "winston";
import { createLogger } from "../logging/create-logger.js";

export interface Service {
  serviceName: string;

  start?(): void | Promise<void>;

  close?(): void | Promise<void>;
}

export abstract class ServiceBase implements Service {
  protected readonly log: Logger;

  protected constructor(public readonly serviceName: string) {
    this.log = createLogger(serviceName);
  }
}
