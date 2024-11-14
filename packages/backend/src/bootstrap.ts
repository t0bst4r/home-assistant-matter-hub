import { config } from "@matter/nodejs/config";

config.trapProcessSignals = false;
config.setProcessExitCodeOnError = false;
config.loadConfigFile = false;
config.loadProcessArgv = false;
config.loadProcessEnv = false;
