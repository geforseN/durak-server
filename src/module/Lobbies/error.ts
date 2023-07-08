export class DeleteLobbyError extends Error {
  constructor() {
    super("Нет такого лобби");
    this.name = "Ошибка удаления лобби";
  }
}

export class LobbyAccessError extends Error {
  constructor(message: string = "Вы не являетесь админом лобби") {
    super(message);
    this.name = "Ошибка доступа";
  }
}

export class FindLobbyError extends Error {
  constructor(message?: string) {
    super(message || "Лобби не найдено");
    this.name = "Ошибка нахождения лобби";
  }
}
