import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { type PropsWithChildren, useCallback, useState } from "react";
import type { NotificationOptions } from "./notification-options.ts";
import { NotificationsContext } from "./notifications-context.ts";

let nextNotificationId = 0;

interface Notification extends NotificationOptions {
  notificationId: number;
}

export const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const show = useCallback((notification: NotificationOptions) => {
    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        autoHideDuration: notification.autoHideDuration ?? 6000,
        notificationId: nextNotificationId++,
      },
    ]);
  }, []);

  const deleteNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((n) => n.notificationId !== notificationId),
    );
  };

  return (
    <NotificationsContext.Provider value={{ show }}>
      {props.children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.notificationId}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => deleteNotification(notification.notificationId)}
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            sx={{ minWidth: "300px" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationsContext.Provider>
  );
};
