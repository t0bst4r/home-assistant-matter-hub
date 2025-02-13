import { config } from "@matter/nodejs/config";

config.trapProcessSignals = true;
config.setProcessExitCodeOnError = true;
config.loadConfigFile = false;
config.loadProcessArgv = false;
config.loadProcessEnv = false;
