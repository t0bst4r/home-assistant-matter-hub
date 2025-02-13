import { StorageBackendJsonFile } from "@matter/nodejs";
import { ClusterId } from "@home-assistant-matter-hub/common";
import _ from "lodash";
import { Logger } from "@matter/general";
import { LoggerService } from "../logger.js";

/**
 * @deprecated
 */
export class LegacyCustomStorage extends StorageBackendJsonFile {
  private readonly log: Logger;

  constructor(loggerService: LoggerService, path: string) {
    super(path);
    this.log = loggerService.get("LegacyCustomStorage");

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
        try {
          const object = deserialize(json);
          return this.removeClusters(object, Object.values(ClusterId));
        } catch (e) {
          this.log.error(
            `Failed to parse json file '${path}' with content: \n\n${json}\n\n`,
          );
          throw e;
        }
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
