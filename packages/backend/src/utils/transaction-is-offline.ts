import type { ActionContext } from "@matter/main";
import { hasLocalActor } from "@matter/main/protocol";

export function transactionIsOffline(
  context: ActionContext | undefined | null,
) {
  return !context || hasLocalActor(context);
}
