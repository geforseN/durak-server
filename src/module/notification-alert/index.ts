import { randomUUID } from "node:crypto";
import { NotificationAlert as NA } from "./namespace";

export default class NotificationAlert {
  message: NA.message;
  type: NA.type;
  durationInMS: NA.durationInMS;
  id: NA.id;

  constructor(data: Error | NA.NotificationAlert = {}) {
    if (data instanceof Error) {
      this.message = data.message || "Произошла ошибка";
      this.type = "Error";
      this.durationInMS = 5_000;
      this.id = randomUUID();
      return;
    }
    this.message = data.message || "Произошла ошибка";
    this.type = data.type || "Warning";
    this.durationInMS = data.durationInMS || 5_000;
    this.id = data.id || randomUUID();
  }
}
