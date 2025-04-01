import { type ActionContext, AsyncObservable as Base } from "@matter/main";

export const AsyncObservable = <T>() =>
  Base<[value: T, oldValue: T, context: ActionContext]>();
