import { randomUUID } from "node:crypto";
import { NotificationAlert as NA } from "./namespace";
export default class NotificationAlert {
  constructor(
    private _message: NA.message = "Произошла ошибка",
    private _type: NA.type = "Warning",
    private _durationInMS: NA.durationInMS = 5_000,
    private _id: NA.id = randomUUID(),
) {}

  fromError(
    error: Error,
  ): NotificationAlert {
    return {
      ...this,
      _message: error.message
    }
  }
}

