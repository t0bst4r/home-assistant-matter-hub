import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  UnsubscribeFunc,
} from "home-assistant-js-websocket";
import {
  HomeAssistantEntityRegistryWithInitialState,
  HomeAssistantEntityState,
  HomeAssistantFilter,
} from "@home-assistant-matter-hub/common";
import { Logger } from "winston";
import { ServiceBase } from "../utils/service.js";
import _, { Dictionary } from "lodash";
import { Subject } from "rxjs";
import crypto from "node:crypto";
import { subscribeEntities } from "./subscribe-entities.js";
import { matchEntityFilter } from "./match-entity-filter.js";
import { getRegistry } from "./api/get-registry.js";
import { HomeAssistantActions } from "./home-assistant-actions.js";
import { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
  readonly logger: Logger;
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
  private _registry?: Dictionary<HomeAssistantEntityRegistryWithInitialState>;

  private subscriptions: Record<string, HomeAssistantFilter> = {};
  private unsubscribeState?: UnsubscribeFunc;

  constructor(props: HomeAssistantClientProps) {
    super("HomeAssistantClient", props.logger);
    this.url = props.url.replace(/\/$/, "");
    this.accessToken = props.accessToken;
  }

  async start() {
    this.close();

    this.connection = await createConnection({
      auth: createLongLivedTokenAuth(this.url, this.accessToken),
    });
    const registry = await getRegistry(this.connection);
    this._registry = _.fromPairs(
      _.toPairs(registry).filter(([, item]) => {
        const hasState = !!item.initialState;
        if (!hasState) {
          this.log.warn("%s does not have an initial-state", item.entity_id);
        }
        return hasState;
      }),
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
  }

  registry(
    filter: HomeAssistantFilter,
  ): HomeAssistantEntityRegistryWithInitialState[] {
    if (!this._registry) {
      throw new Error("Home Assistant Client is not yet initialized");
    }
    return _.filter(this._registry, (r) => matchEntityFilter(r, filter));
  }

  states(
    filter: HomeAssistantFilter,
    cb: (entities: Dictionary<HomeAssistantEntityState>) => Promise<void>,
  ): () => void {
    const handle = crypto.randomUUID();
    this.subscriptions[handle] = filter;
    this.refreshSubscription();

    const sub = this.states$.subscribe(cb);

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
