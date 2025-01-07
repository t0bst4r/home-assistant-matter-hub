import { useContext } from "react";
import { NotificationsContext } from "./notifications-context.ts";

export function useNotifications() {
  const context = useContext(NotificationsContext);
  return { show: context.show };
}
