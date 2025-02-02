import {
  Logger,
  LogLevel as MatterLogLevel,
  logLevelFromString as matterLogLevelFromString,
  LogFormat,
} from "@matter/general";
import { Environment } from "@matter/main";

export enum CustomLogLevel {
  SILLY = -1,
}

export type LogLevel = CustomLogLevel | MatterLogLevel;
type LogLevelName = keyof (typeof CustomLogLevel & typeof MatterLogLevel);

export function logging(
  environment: Environment,
  level: string | undefined,
  disableColors: boolean,
) {
  const loggerService = new LoggerService();
  loggerService.level = logLevelFromString(level ?? "info");
  if (disableColors) {
    loggerService.format = LogFormat.PLAIN;
  }
  environment.set(LoggerService, loggerService);
}

function logLevelFromString(
  level: LogLevelName | string,
): CustomLogLevel | MatterLogLevel {
  const customNames: Record<keyof typeof CustomLogLevel, CustomLogLevel> = {
    SILLY: CustomLogLevel.SILLY,
  };
  if (level.toUpperCase() in customNames) {
    return customNames[level.toUpperCase() as keyof typeof CustomLogLevel];
  }
  return matterLogLevelFromString(level);
}

export class LoggerService {
  private _level: LogLevel = MatterLogLevel.INFO;

  private readonly customLogLevelMapping: Record<
    CustomLogLevel,
    MatterLogLevel
  > = {
    [CustomLogLevel.SILLY]: MatterLogLevel.DEBUG,
  };

  set level(value: LogLevel | undefined) {
    this._level = value ?? this._level;
    Logger.level =
      this.customLogLevelMapping[this._level as CustomLogLevel] ??
      (this._level as MatterLogLevel);
  }

  set format(format: string) {
    Logger.format = format;
  }

  get(name: string): BetterLogger {
    return new BetterLogger(name, this._level);
  }
}

export class BetterLogger extends Logger {
  constructor(
    name: string,
    private readonly _level: LogLevel,
  ) {
    super(name);
  }

  silly(...values: unknown[]): void {
    if (this._level <= CustomLogLevel.SILLY) {
      this.debug(...["SILLY", ...values]);
    }
  }
}
