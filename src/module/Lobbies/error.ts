export class DeleteLobbyError extends Error {
  constructor(message = "Нет такого лобби") {
    super(message);
    this.name = "Ошибка удаления лобби";
  }
}

export class LobbyAccessError extends Error {
  constructor(message = "Вы не являетесь админом лобби") {
    super(message);
    this.name = "Ошибка доступа";
  }
}

export class FindLobbyError extends Error {
  constructor(message = "Лобби не найдено") {
    super(message);
    this.name = "Ошибка нахождения лобби";
  }
}
