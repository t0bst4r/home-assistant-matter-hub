import { Logger } from "winston";
import { createChildLogger } from "../logging/create-child-logger.js";

export interface Service {
  serviceName: string;

  start?(): void | Promise<void>;

  close?(): void | Promise<void>;
}

export abstract class ServiceBase implements Service {
  protected readonly log: Logger;

  protected constructor(
    public readonly serviceName: string,
    logger: Logger,
  ) {
    this.log = createChildLogger(logger, serviceName);
  }
}
