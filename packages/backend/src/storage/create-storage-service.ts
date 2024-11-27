import { Storage } from "@matter/main";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { StorageBackendJsonFile } from "@matter/nodejs";
import { createLogger } from "../logging/create-logger.js";
import { ClusterId } from "@home-assistant-matter-hub/common";
