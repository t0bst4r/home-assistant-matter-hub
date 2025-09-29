import { Environment, VariableService } from "@matter/main";
import AsyncLock from "async-lock";
import { LoggerService } from "./logger.js";
import { mdns } from "./mdns.js";
import type { Options } from "./options.js";
import { storage } from "./storage.js";

export function configureDefaultEnvironment(options: Options) {
  const env = Environment.default;
  env.runtime;
  new VariableService(env);

  env.set(AsyncLock, new AsyncLock());
  env.set(LoggerService, new LoggerService(options.logging));

  mdns(env, options.mdns);
  storage(env, options.storage);
  return env;
}
