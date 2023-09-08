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

// TODO use
