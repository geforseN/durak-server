import NotificationAlert from "@/module/NotificationAlert/index.js";

export class InputError extends Error {
  constructor(message = "Введены неверные данные") {
    super(message);
  }
}

export class InternalError extends Error {
  constructor(message = "Ошибка сервера") {
    super(message);
  }
}

export class InternalGameLogicError extends Error {}

export class NotificationToSelf extends Error {}

export class GameLogicError extends Error {
  get asNotificationAlert() {
    return new NotificationAlert(this);
  }
}

type BadAllowedPlayerInputHeader =
  | "Attack move attempt"
  | "Defense move attempt"
  | "Move attempt"
  | "Stop move attempt"
  | "Transfer move attempt";

export class AllowedPlayerBadInputError extends Error {
  header?: BadAllowedPlayerInputHeader;

  constructor(
    message: string,
    options?: { header?: BadAllowedPlayerInputHeader },
  ) {
    super(message);
    this.header = options?.header;
  }

  get asNotificationAlert() {
    return new NotificationAlert(this);
  }
}
