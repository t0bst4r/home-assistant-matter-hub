import { Environment, type Logger } from "@matter/main";
import type { ClassType } from "../../utils/class-type.js";
import type { Service } from "./service.js";

export interface ContainerBaseOptions {
  id: string;
  log: Logger;
  parent: Environment;
}

export class EnvironmentBase extends Environment {
  protected readonly log: Logger;
  private readonly services: Service[] = [];

  constructor(options: ContainerBaseOptions) {
    super(options.id, options.parent);
    this.log = options.log;
  }

  override async load<T extends object>(type: ClassType<T>): Promise<T> {
    const instance = this.get(type);
    if ("construction" in instance) {
      await instance.construction;
    }
    return instance;
  }

  override set<T extends {}>(type: ClassType<T>, instance: T) {
    if (this.isService(instance)) {
      this.services.push(instance);
    }
    return super.set(type, instance);
  }

  async dispose() {
    while (this.services.length > 0) {
      const service = this.services.pop()!;
      this.log.info(`Disposing ${service.serviceName}`);
      await service.dispose?.();
    }
  }

  private isService(instance: object): instance is Service {
    return "serviceName" in instance;
  }
}
