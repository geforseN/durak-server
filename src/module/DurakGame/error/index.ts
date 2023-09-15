import NotificationAlert from "../../NotificationAlert/index.js";

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

// export class NotificationToSelf

export class GameLogicError extends Error {
  get asNotificationAlert() {
    return new NotificationAlert(this);
  }
}

type BadAllowedPlayerInputHeader =
  | "Transfer move attempt"
  | "Defense move attempt"
  | "Attack move attempt"
  | "Move attempt";

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

// header TransferMove attempt
// transfer moves no more allowed
// no such rank found on board

// header AttackMove attempt

// header DefendMove attempt
