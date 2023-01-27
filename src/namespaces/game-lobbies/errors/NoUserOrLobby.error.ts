export default class NoUserOrLobbyError extends Error {
  constructor() {
    super();
    this.message = "Нет пользователя или лобби";
  }
}