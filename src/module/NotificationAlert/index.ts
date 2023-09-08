import crypto from "node:crypto";
import { type NotificationAlert as TNotificationAlert } from "@durak-game/durak-dts";

export default class NotificationAlert {
  message;
  type;
  durationInMS;
  id;

  constructor(data: Partial<TNotificationAlert> = {}) {
    data.message ??= "Произошла ошибка";
    data.durationInMS ??= 5_000;
    data.id ??= crypto.randomUUID();
    this.message = data.message;
    this.type = data.type
      ? data.type
      : data instanceof Error
      ? "Error"
      : "Warning";
    this.durationInMS = data.durationInMS;
    this.id = data.id;
  }
}
