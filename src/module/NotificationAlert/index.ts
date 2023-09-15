import crypto from "node:crypto";
import { type NotificationAlert as TNotificationAlert } from "@durak-game/durak-dts";

export default class NotificationAlert {
  message: TNotificationAlert["message"];
  type: TNotificationAlert["type"];
  durationInMS: TNotificationAlert["durationInMS"];
  id: TNotificationAlert["id"];
  header?: string

  constructor(data: Partial<TNotificationAlert & {header: string}> = {}) {
    data.message ??= "Произошла ошибка";
    data.durationInMS ??= 5_000;
    data.id ??= crypto.randomUUID();
    data.type ??= data instanceof Error ? "Error" : "Warning";
    this.message = data.message;
    this.type = data.type;
    this.durationInMS = data.durationInMS;
    this.id = data.id;
    this.header = data.header
  }

  isNotification(): this is NotificationAlert {
    return true;
  }
}
