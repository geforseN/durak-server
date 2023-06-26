export default class NotAuthorizedError extends Error {
  constructor() {
    super("Вы не авторизованы");
  }
}