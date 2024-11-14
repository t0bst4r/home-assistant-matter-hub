import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  getStates,
  UnsubscribeFunc,
} from "home-assistant-js-websocket";
import {
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
  HomeAssistantFilter,
} from "@home-assistant-matter-hub/common";
import { ServiceBase } from "../utils/service.js";
import _, { Dictionary } from "lodash";
import { map, pairwise, startWith, Subject } from "rxjs";
import crypto from "node:crypto";
import { subscribeEntities } from "./api/subscribe-entities.js";
import { matchEntityFilter } from "./match-entity-filter.js";
import { getRegistry } from "./api/get-registry.js";
import { HomeAssistantActions } from "./home-assistant-actions.js";
import { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { isValidEntity } from "./is-valid-entity.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
}

export class HomeAssistantClient
  extends ServiceBase
  implements HomeAssistantActions
{
  private readonly url: string;
  private readonly accessToken: string;

  private readonly states$ = new Subject<
    Dictionary<HomeAssistantEntityState>
  >();
  private connection?: Connection;

  private _initialStates?: Dictionary<HomeAssistantEntityState>;
  private _registry?: Dictionary<HomeAssistantEntityRegistry>;

  private subscriptions: Record<string, HomeAssistantFilter> = {};
  private unsubscribeState?: UnsubscribeFunc;

  constructor(props: HomeAssistantClientProps) {
    super("HomeAssistantClient");
    this.url = props.url.replace(/\/$/, "");
    this.accessToken = props.accessToken;
  }

  async start() {
    this.close();

    this.connection = await createConnection({
      auth: createLongLivedTokenAuth(this.url, this.accessToken),
    });
    this._initialStates = _.keyBy(
      await getStates(this.connection),
      (e) => e.entity_id,
    );
    this._registry = _.keyBy(
      await getRegistry(this.connection),
      (r) => r.entity_id,
    );
    this.subscriptions = {};
  }

  close() {
    this.unsubscribeState?.();
    this.unsubscribeState = undefined;
    this.subscriptions = {};

    this.connection?.close();
    this.connection = undefined;

    this._registry = undefined;
    this._initialStates = undefined;
  }

  registry(
    filter: HomeAssistantFilter,
  ): Dictionary<HomeAssistantEntityRegistry> {
    if (!this._registry) {
      throw new Error("Home Assistant Client is not yet initialized");
    }
    return _.pickBy(this._registry, (r) => {
      const isValid = isValidEntity(r);
      if (!isValid) {
        this.log.silly(
          "Entity '%s' is excluded. Disabled by: %s, hidden by: %s",
          r.entity_id,
          r.disabled_by,
          r.hidden_by,
        );
      }
      return isValid && matchEntityFilter(r, filter);
    });
  }

  initialStates(entityIds: string[]): Dictionary<HomeAssistantEntityState> {
    return _.pickBy(this._initialStates, (e) =>
      entityIds.includes(e.entity_id),
    );
  }

  subscribeStates(
    filter: HomeAssistantFilter,
    cb: (entities: Dictionary<HomeAssistantEntityState>) => Promise<void>,
  ): () => void {
    const handle = crypto.randomUUID();
    this.subscriptions[handle] = filter;
    this.refreshSubscription();

    const sub = this.states$
      .pipe(
        startWith(null),
        pairwise(),
        map(([oldValue, newValue]) => {
          return _.pickBy(newValue ?? {}, (state, key) => {
            return (
              JSON.stringify((oldValue ?? {})[key]) !== JSON.stringify(state)
            );
          });
        }),
      )
      .subscribe(cb);

    return () => {
      sub.unsubscribe();
      delete this.subscriptions[handle];
      this.refreshSubscription();
    };
  }

  async callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    if (!this.connection) {
      throw new Error("Home Assistant Client is not yet initialized");
    }
    this.log.debug(
      "Calling action '%s.%s' for target %s with data %s",
      domain,
      action,
      JSON.stringify(target),
      JSON.stringify(data),
    );
    const result = await callService(
      this.connection,
      domain,
      action,
      data,
      target,
      returnResponse,
    );
    return result as T;
  }

  private refreshSubscription() {
    if (!this.connection || !this._registry) {
      throw new Error("Home Assistant Client is not yet initialized");
    }

    const filters: HomeAssistantFilter[] = _.values(this.subscriptions);
    const allObservedEntities = _.values(this._registry)
      .filter((r) => filters.some((f) => matchEntityFilter(r, f)))
      .map((r) => r.entity_id);

    this.log.debug(
      "Refreshing Home Assistant Subscription. Now observing %s entities",
      allObservedEntities.length,
    );

    this.unsubscribeState?.();
    this.unsubscribeState = subscribeEntities(
      this.connection,
      (states) => {
        this.states$.next(states);
      },
      allObservedEntities,
    );
  }
}
