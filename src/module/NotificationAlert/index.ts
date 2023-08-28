import crypto from "node:crypto";
import { NotificationAlert as TNotificationAlert } from "@durak-game/durak-dts";
export default class NotificationAlert {
  message;
  type;
  durationInMS;
  id;

  constructor(
    {
      message = "Произошла ошибка",
      durationInMS = 5_000,
      type = "Warning",
      id = crypto.randomUUID(),
      ...data // TODO maybe can work not how wanted
    }: Partial<TNotificationAlert> = {
    },
  ) {
    this.message = message;
    // TODO maybe can work not how wanted
    this.type = data instanceof Error ? "Error" : type;
    this.durationInMS = durationInMS;
    this.id = id;
  }
}
