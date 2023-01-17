import { randomUUID } from "node:crypto";
import { NotificationAlert } from "../notification-alert.type";

export default function generateNotificationFromError(
  error: Error,
  notification?: NotificationAlert,
): NotificationAlert {
  return {
    message: error.message,
    durationInMS: notification?.durationInMS || 5_000,
    type: notification?.type || "Error",
    id: notification?.id || randomUUID(),
  };
}
