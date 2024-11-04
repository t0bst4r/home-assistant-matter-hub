import { ActionContext } from "@project-chip/matter.js/behavior";
import { AsyncObservable as Base } from "@project-chip/matter.js/util";

export const AsyncObservable = <T>() =>
  Base<[value: T, oldValue: T, context: ActionContext]>();
