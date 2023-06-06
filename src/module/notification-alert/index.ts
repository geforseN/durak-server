import { randomUUID } from "node:crypto";
import { NotificationAlert as NA } from "./namespace";

export default class NotificationAlert {
  private message: NA.message;
  private type: NA.type;
  private durationInMS: NA.durationInMS;
  private id: NA.id;

  constructor(customSettings?: NA.NotificationAlert) {
    const settings = { ...this.#defaultSettings, ...customSettings };
    this.message = settings.message;
    this.type = settings.type;
    this.durationInMS = settings.durationInMS;
    this.id = settings.id;
  }

  get #defaultSettings(): Required<NA.NotificationAlert> {
    return {
      message: "Произошла ошибка",
      type: "Warning",
      durationInMS: 5_000,
      id: randomUUID(),
    };
  }

  fromError(
    error: Error,
  ): this {
    this.message &&= error.message;
    this.type = "Error";
    return this;
  }
}

