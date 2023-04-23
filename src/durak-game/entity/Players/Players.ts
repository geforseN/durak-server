import assert from "node:assert";
import LobbyUsers, { LobbyUserIdentifier } from "../../../namespaces/lobbies/entity/lobby-users";
import { Attacker, Defender, Player } from "../Players";
import Card from "../Card";

export default class Players {
  __value: Player[];
  manager: PlayersManager;

  constructor(users: LobbyUsers) {
    this.__value = users.value.map((user) => new Player(user));
    this.manager = new PlayersManager(this);
  }

  get count() {
    return this.__value.length;
  }

  receiveFirstCards({ talonCards, howMany }: { talonCards: Card[], howMany: number }) {
    for (let i = 0, playerIndex = 0; talonCards.length !== 0; i++, playerIndex = i % this.count) {
      const player = this.__value[playerIndex];
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
    assert.ok(attacker, "Атакующий не найден");
    return attacker;
  }

  getDefender(): Defender | undefined {
    for (const player of this.__value) {
      if (player instanceof Defender) return player;
    }
  }

  tryGetDefender(): Defender {
    const defender = this.getDefender();
    assert.ok(defender, "Защищающийся не найден");
    return defender;
  }

  getPlayer({ accname }: LobbyUserIdentifier): Player | undefined {
    return this.__value.find((player) => player.info.accname === accname);
  }

  tryGetPlayer({ accname }: LobbyUserIdentifier): Player {
    const player = this.getPlayer({ accname });
    assert.ok(player, "Игрок не найден");
    return player;
  }

  getPlayerIndex({ accname }: LobbyUserIdentifier): number {
    return this.__value.findIndex((player) => player.info.accname === accname);
  }

  getPlayerEnemies({ accname }: LobbyUserIdentifier): Player[] {
    return this.__value.filter((player) => player.info.accname !== accname);
  }

  isAttacker(player: Player): player is Attacker {
    return player instanceof Attacker;
  }

  isDefender(player: Player): player is Defender {
    return player instanceof Defender;
  }

  make<P extends Player>(
    PlayerLike: { new(player: Player): P },
    playerOrIdentifier: Player | LobbyUserIdentifier,
  ): P {
    const accname = this.getAccname(playerOrIdentifier);
    const playerIndex = this.getPlayerIndex({ accname });
    const instance = new PlayerLike(this.__value[playerIndex]);
    this.__value[playerIndex] = instance;
    return instance;
  }

  private getAccname(playerOrIdentifier: Player | LobbyUserIdentifier): string {
    return playerOrIdentifier instanceof Player
      ? playerOrIdentifier.info.accname
      : playerOrIdentifier.accname;
  }

  private get<P extends Player>(PlayerClass: { new(...arg: any): P }): P | undefined {
    for (const player of this.__value) {
      if (player instanceof PlayerClass) return player;
    }
  }
}