import {randomUUID} from "node:crypto"
import {Notification} from "../notification";

export default function generateNotificationFromError(
  error: Error,
  notification?: Notification,
): Notification {
  return {
    message: error.message,
    durationInMS: notification?.durationInMS || 5_000,
    type: notification?.type || "Error",
    id: notification?.id || randomUUID(),
  };
}
