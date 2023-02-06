import LobbyUsers, { LobbyUserIdentifier } from "../../../namespaces/lobbies/entity/lobby-users";
import Player from "./Player";
import Card from "../Card";
import Self from "../../DTO/Self.dto";
import Enemy from "../../DTO/Enemy.dto";

export default class Players {
  __value: Player[];

  constructor(users: LobbyUsers) {
    this.__value = users.value.map((user) => new Player(user));
    this.defineSidePlayers();
  }

  get count() {
    return this.__value.length;
  }

  receiveCardsByOne(cards: Card[]) {
    cards.forEach((card, index) => {
      const playerIndex = index % this.count;
      this.__value[playerIndex].receiveCards(card);
    });
  }

  getPlayer({ accname }: LobbyUserIdentifier): Player | undefined {
    return this.__value.find((player) => player.info.accname === accname);
  }

  getPlayerIndex({ accname }: LobbyUserIdentifier): number {
    return this.__value.findIndex((player) => player.info.accname === accname);
  }

  getSelf({ accname }: LobbyUserIdentifier): Self {
    const player = this.getPlayer({ accname })!;
    return new Self(player);
  }

  getPlayerEnemies({ accname }: LobbyUserIdentifier): Player[] {
    return this.__value.filter((player) => player.info.accname !== accname);
  }

  getEnemies({ accname }: LobbyUserIdentifier): Enemy[] {
    const players = this.getPlayerEnemies({ accname });
    return players.map(player => new Enemy(player));
  }

  private defineSidePlayers(): void {
    this.__value.forEach((player, playerIndex, players) => {
      const leftPlayerIndex = this.count % (playerIndex + 1);
      const rightPlayerIndex = playerIndex === 0 ? this.count - 1 : playerIndex - 1;

      player.left = players[leftPlayerIndex];
      player.right = players[rightPlayerIndex];
    });
  }
}