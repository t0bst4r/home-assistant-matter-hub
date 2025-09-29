import { LogFormat, Logger, LogLevel as MatterLogLevel } from "@matter/general";
import type { Service } from "../ioc/service.js";

export enum CustomLogLevel {
  SILLY = -1,
}

export type LogLevel = CustomLogLevel | MatterLogLevel;
type LogLevelName = keyof (typeof CustomLogLevel & typeof MatterLogLevel);

function logLevelFromString(
  level: LogLevelName | string,
): CustomLogLevel | MatterLogLevel {
  const customNames: Record<keyof typeof CustomLogLevel, CustomLogLevel> = {
    SILLY: CustomLogLevel.SILLY,
  };
  if (level.toUpperCase() in customNames) {
    return customNames[level.toUpperCase() as keyof typeof CustomLogLevel];
  }
  return MatterLogLevel(level);
}

export interface LoggerServiceProps {
  readonly level: string;
  readonly disableColors: boolean;
}

export class LoggerService {
  private readonly _level: LogLevel = MatterLogLevel.INFO;
  private readonly customLogLevelMapping: Record<
    CustomLogLevel,
    MatterLogLevel
  > = {
    [CustomLogLevel.SILLY]: MatterLogLevel.DEBUG,
  };

  constructor(options: LoggerServiceProps) {
    this._level = logLevelFromString(options.level ?? "info");
    Logger.level =
      this.customLogLevelMapping[this._level as CustomLogLevel] ??
      (this._level as MatterLogLevel);
    Logger.format = options.disableColors ? LogFormat.PLAIN : LogFormat.ANSI;
  }

  get(name: string): BetterLogger;
  get(name: Service): BetterLogger;
  get(nameOrService: string | Service): BetterLogger {
    let name: string;
    if (typeof nameOrService === "string") {
      name = nameOrService;
    } else {
      name = nameOrService.serviceName;
    }
    return new BetterLogger(name, this._level);
  }
}

export class BetterLogger extends Logger {
  constructor(
    private readonly name: string,
    private readonly _level: LogLevel,
  ) {
    super(name);
  }

  createChild(name: string) {
    return new BetterLogger(`${this.name} / ${name}`, this._level);
  }

  silly(...values: unknown[]): void {
    if (this._level <= CustomLogLevel.SILLY) {
      this.debug(...["SILLY", ...values]);
    }
  }
}
