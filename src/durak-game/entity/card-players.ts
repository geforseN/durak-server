import LobbyUsers, { LobbyUserIdentifier } from "../../namespaces/lobbies/entity/lobby-users";
import CardPlayer from "./card-player";
import Card from "./card";
import Self from "../DTO/Self.dto";
import Enemy from "../DTO/Enemy.dto";

export type OtherPlayerInfo = { accname: string, cardCount: number };

export default class CardPlayers {
  __value: CardPlayer[];

  constructor(users: LobbyUsers) {
    this.__value = users.value.map((user) => new CardPlayer(user));
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

  getPlayer({ accname }: LobbyUserIdentifier): CardPlayer {
    return this.__value.find((player) => player.info.accname === accname)!;
  }

  getSelf({ accname }: LobbyUserIdentifier): Self {
    const player = this.getPlayer({ accname })!;
    return new Self(player);
  }

  getPlayerEnemies({ accname }: LobbyUserIdentifier): CardPlayer[] {
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