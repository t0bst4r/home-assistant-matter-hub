import { Environment, StorageService } from "@matter/main";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { StorageBackendJsonFile } from "@matter/nodejs";
import { ClusterId } from "@home-assistant-matter-hub/common";
import _ from "lodash";

export function storage(
  environment: Environment,
  storageLocation: string | undefined,
) {
  const location = resolveStorageLocation(storageLocation);
  fs.mkdirSync(location, { recursive: true });
  const storageService = environment.get(StorageService);
  storageService.location = location;
  storageService.factory = (ns) =>
    new CustomStorage(path.resolve(location, ns + ".json"));
}

function resolveStorageLocation(storageLocation: string | undefined) {
  const homedir = os.homedir();
  return storageLocation
    ? path.resolve(storageLocation.replace(/^~\//, homedir + "/"))
    : path.join(homedir, ".home-assistant-matter-hub");
}

class CustomStorage extends StorageBackendJsonFile {
  constructor(path: string) {
    super(path);

    const parser = this as unknown as {
      fromJson: (json: string) => object;
      toJson: (object: object) => string;
    };

    const serialize = parser.toJson.bind(parser);
    const deserialize = parser.fromJson.bind(parser);
    parser.fromJson = (json: string) => {
      if (json.trim().length === 0) {
        return {};
      } else {
        const object = deserialize(json);
        return this.removeClusters(object, Object.values(ClusterId));
      }
    };

    parser.toJson = (object: object) => {
      const json = serialize(
        this.removeClusters(object, [ClusterId.homeAssistantEntity]),
      );
      if (json.trim().length === 0) {
        throw new Error(`Tried to write empty storage to ${path}`);
      }
      return json;
    };
  }

  private removeClusters(object: object, clusters: ClusterId[]): object {
    if (clusters.length === 0) {
      return object;
    }
    const keys = Object.keys(object).filter(
      (key) =>
        key.startsWith("root.parts.") &&
        clusters.some((cluster) => key.endsWith(`.${cluster}`)),
    );
    return _.pickBy(object, (_, key) => !keys.includes(key));
  }
}
