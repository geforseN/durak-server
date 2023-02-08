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

  tryGetPlayer({ accname }: LobbyUserIdentifier): Player {
    const player = this.getPlayer({ accname });
    this.assertPlayer(player);
    return player;
  }

  assertPlayer(player: Player | undefined): asserts player is Player {
    if (player === undefined) throw new Error("Нет такого игрока");
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
    this.__value.forEach((player, index, players) => {
      player.left = players[this.getLeftPlayerIndex(index)];
      player.right = players[this.getRightPlayerIndex(index)];
    });
  }

  private getLeftPlayerIndex(index: number) {
    const isLastPlayer = index === this.count - 1;
    return isLastPlayer ? 0 : index + 1;
  }

  private getRightPlayerIndex(index: number) {
    const isFirstPlayer = index === 0;
    return isFirstPlayer ? this.count - 1 : index - 1;
  }
}