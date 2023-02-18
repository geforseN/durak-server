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

  receiveCards({ talonCards, howMany }: { talonCards: Card[], howMany: number }) {
    for (let i = 0, playerI = 0; talonCards.length !== 0; i++, playerI = i % this.count) {
      const player = this.__value[playerI];
      const startIndex = talonCards.length - howMany;
      const cards = talonCards.splice(startIndex, howMany);
      player.receiveCards(...cards);
    }
  }

  getAttacker(): Attacker | undefined {
    for (const player of this.__value) {
      if (player instanceof Attacker) return player;
    }
  }

  tryGetAttacker(): Attacker {
    const attacker = this.getAttacker();
    this.assertPlayer(attacker, "Атакующий не найден");
    return attacker;
  }

  getPlayer({ accname }: LobbyUserIdentifier): Player | undefined {
    return this.__value.find((player) => player.info.accname === accname);
  }

  tryGetPlayer({ accname }: LobbyUserIdentifier): Player {
    const player = this.getPlayer({ accname });
    this.assertPlayer(player);
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

  private assertPlayer(player: Player | undefined, message?: string): asserts player is Player {
    if (player === undefined) throw new Error(message ?? "Игрок не найден");
  }
}