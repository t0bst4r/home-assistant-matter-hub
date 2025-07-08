import type { ActionContext } from "@matter/main";

export function transactionIsOffline(
  context: ActionContext | undefined | null,
) {
  return context?.offline === true;
}
