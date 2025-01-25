import { NotificationsContext } from "./notifications-context.ts";
import { PropsWithChildren, useCallback, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { NotificationOptions } from "./notification-options.ts";

let nextNotificationId: number = 0;

interface Notification extends NotificationOptions {
  notificationId: number;
}

export const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const show = useCallback(
    (notification: NotificationOptions) => {
      setNotifications((prev) => [
        ...prev,
        {
          ...notification,
          autoHideDuration: notification.autoHideDuration ?? 6000,
          notificationId: nextNotificationId++,
        },
      ]);
    },
    [setNotifications],
  );

  const deleteNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((n) => n.notificationId !== notificationId),
    );
  };

  return (
    <>
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
    </>
  );
};
