import LobbyUsers, { LobbyUserIdentifier } from "../../../namespaces/lobbies/entity/lobby-users";
import Player from "./Player";
import Card from "../Card";
import Attacker from "./Attacker";
import Defender from "./Defender";

export default class Players {
  __value: Player[];

  constructor(users: LobbyUsers) {
    this.__value = users.value.map((user) => new Player(user));
    this.defineSidePlayers();
    this.defineIndexes();
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
    this.assertPlayerNotUndefined(player);
    return player;
  }

  getPlayerIndex({ accname }: LobbyUserIdentifier): number {
    return this.__value.findIndex((player) => player.info.accname === accname);
  }

  getPlayerEnemies({ accname }: LobbyUserIdentifier): Player[] {
    return this.__value.filter((player) => player.info.accname !== accname);
  }

  makePlayer(playerOrIdentifier: Player | LobbyUserIdentifier): Player {
    return this.make(playerOrIdentifier, Player);
  }

  makeAttacker(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    return this.make(playerOrIdentifier, Attacker);
  }

  makeDefender(playerOrIdentifier: Player | LobbyUserIdentifier): Defender {
    return this.make(playerOrIdentifier, Defender);
  }

  isAttacker(player: Player): player is Attacker {
    return player instanceof Attacker;
  }

  isDefender(player: Player): player is Defender {
    return player instanceof Defender;
  }

  private make<P extends Player>(
    playerOrIdentifier: Player | LobbyUserIdentifier, PlayerP: { new(player: Player): P },
  ): P {
    const accname = this.getAccname(playerOrIdentifier);
    const playerIndex = this.getPlayerIndex({ accname });
    const instance = new PlayerP(this.__value[playerIndex]);
    this.__value[playerIndex] = instance;
    return instance;
  }

  private getAccname(playerOrIdentifier: Player | LobbyUserIdentifier): string {
    return playerOrIdentifier instanceof Player
      ? playerOrIdentifier.info.accname
      : playerOrIdentifier.accname;
  }

  private defineSidePlayers(): void {
    this.__value.forEach((player, index, players) => {
      player.left = players[this.getLeftPlayerIndex(index)];
      player.right = players[this.getRightPlayerIndex(index)];
    });
  }

  private getLeftPlayerIndex(index: number): number {
    const isLastPlayer = index === this.count - 1;
    return isLastPlayer ? 0 : index + 1;
  }

  private getRightPlayerIndex(index: number): number {
    const isFirstPlayer = index === 0;
    return isFirstPlayer ? this.count - 1 : index - 1;
  }

  private defineIndexes(): void {
    this.__value.forEach((player, index) => player.index = index);
  }

  private assertPlayerNotUndefined(player: Player | undefined): asserts player is Player {
    if (player === undefined) throw new Error("Нет такого игрока");
  }
}