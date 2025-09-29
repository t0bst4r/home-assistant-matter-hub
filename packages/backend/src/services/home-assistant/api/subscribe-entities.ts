import crypto from "node:crypto";
import {
  type Connection,
  type Context,
  getCollection,
  type HassEntities,
  type UnsubscribeFunc,
} from "home-assistant-js-websocket";
import type { Store } from "home-assistant-js-websocket/dist/store.js";
import { atLeastHaVersion } from "home-assistant-js-websocket/dist/util.js";

// COPIED FROM home-assistant-js-websocket/lib/entities.ts

interface EntityState {
  /** state */
  s: string;
  /** attributes */
  a: { [key: string]: object };
  /** context */
  c: Context | string;
  /** last_changed; if set, also applies to lu */
  lc: number;
  /** last_updated */
  lu: number;
}

interface EntityStateRemove {
  /** attributes */
  a: string[];
}

interface EntityDiff {
  /** additions */
  "+"?: Partial<EntityState>;
  /** subtractions */
  "-"?: EntityStateRemove;
}

interface StatesUpdates {
  /** add */
  a?: Record<string, EntityState>;
  /** remove */
  r?: string[]; // remove
  /** change */
  c: Record<string, EntityDiff>;
}

function processEvent(store: Store<HassEntities>, updates: StatesUpdates) {
  const state = { ...store.state };

  if (updates.a) {
    for (const entityId in updates.a) {
      const newState = updates.a[entityId];
      const last_changed = new Date(newState.lc * 1000).toISOString();
      state[entityId] = {
        entity_id: entityId,
        state: newState.s,
        attributes: newState.a,
        context:
          typeof newState.c === "string"
            ? { id: newState.c, parent_id: null, user_id: null }
            : newState.c,
        last_changed: last_changed,
        last_updated: newState.lu
          ? new Date(newState.lu * 1000).toISOString()
          : last_changed,
      };
    }
  }

  if (updates.r) {
    for (const entityId of updates.r) {
      delete state[entityId];
    }
  }

  if (updates.c) {
    for (const entityId in updates.c) {
      let entityState = state[entityId];

      if (!entityState) {
        console.warn("Received state update for unknown entity", entityId);
        continue;
      }

      entityState = { ...entityState };

      const { "+": toAdd, "-": toRemove } = updates.c[entityId];
      const attributesChanged = toAdd?.a || toRemove?.a;
      const attributes = attributesChanged
        ? { ...entityState.attributes }
        : entityState.attributes;

      if (toAdd) {
        if (toAdd.s !== undefined) {
          entityState.state = toAdd.s;
        }
        if (toAdd.c) {
          if (typeof toAdd.c === "string") {
            entityState.context = { ...entityState.context, id: toAdd.c };
          } else {
            entityState.context = { ...entityState.context, ...toAdd.c };
          }
        }
        if (toAdd.lc) {
          entityState.last_updated = entityState.last_changed = new Date(
            toAdd.lc * 1000,
          ).toISOString();
        } else if (toAdd.lu) {
          entityState.last_updated = new Date(toAdd.lu * 1000).toISOString();
        }
        if (toAdd.a) {
          Object.assign(attributes, toAdd.a);
        }
      }
      if (toRemove?.a) {
        for (const key of toRemove.a) {
          delete attributes[key];
        }
      }
      if (attributesChanged) {
        entityState.attributes = attributes;
      }
      state[entityId] = entityState;
    }
  }

  store.setState(state, true);
}

const subscribeUpdates = (
  conn: Connection,
  store: Store<HassEntities>,
  entityIds: string[],
) => {
  if (entityIds && entityIds.length === 0) {
    return Promise.resolve(async () => {});
  }
  return conn.subscribeMessage<StatesUpdates>((ev) => processEvent(store, ev), {
    type: "subscribe_entities",
    entity_ids: entityIds,
  });
};

function createEntitiesHash(entityIds: string[]): string {
  return crypto
    .createHash("sha256")
    .update(entityIds.join(","))
    .digest("hex")
    .substring(0, 16);
}

export const entitiesColl = (conn: Connection, entityIds: string[]) => {
  if (atLeastHaVersion(conn.haVersion, 2022, 4, 0)) {
    return getCollection(
      conn,
      `_ent_${createEntitiesHash(entityIds)}`,
      undefined,
      (conn: Connection, store: Store<HassEntities>) =>
        subscribeUpdates(conn, store, entityIds),
    );
  }
  throw new Error(`Home Assistant version ${conn.haVersion} is not supported`);
};

export const subscribeEntities = (
  conn: Connection,
  onChange: (state: HassEntities) => void,
  entityIds: string[],
): UnsubscribeFunc => entitiesColl(conn, entityIds).subscribe(onChange);
