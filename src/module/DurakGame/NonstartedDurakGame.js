export default class UnstartedGame {
  constructor(lobby) {
    this.info = { id: lobby.id, adminId: lobby.slots.admin.id };
    this.settings = { ...lobby.settings, moveTime: 90_000 };
    this.players = new Players(lobby.slots.users);  
    this.talon = new Talon(lobby.settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }
}
