import assert from "node:assert";
import PlayersManager from "./PlayersManager";
import LobbyUsers from "../../../namespaces/lobbies/entity/lobby-users";
import { Attacker, Defender, Player, SuperPlayer } from "../Players";
import Talon from "../Deck/Talon";
import { AllowedMissingCardCount } from "./Player";

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

  receiveFirstCards({ talon, cardCount, pushCount }: {
    pushCount: AllowedMissingCardCount;
    cardCount: AllowedMissingCardCount;
    talon: Talon;
  }) {
    for (let i = 0; i < this.count * cardCount; i += pushCount) {
      const playerIndex = i % this.count;
      const player = this.__value[playerIndex];
      talon.provideCards(player, pushCount);
    }
  }

  get attacker(): Attacker {
    const attacker = this.get(Attacker);
    assert.ok(attacker, "Атакующий не найден");
    return attacker;
  }

  get defender(): Defender {
    const defender = this.get(Defender);
    assert.ok(defender, "Защищающийся не найден");
    return defender;
  }

  getPlayer({ id }: { id: string }): Player {
    const player = this.__value.find((player) => player.id === id);
    assert.ok(player, "Игрок не найден");
    return player;
  }

  isDefender(player: Player): player is Defender {
    return player instanceof Defender;
  }

  isSuperPlayer(player: Player): player is SuperPlayer {
    return player instanceof SuperPlayer;
  }

  private get<P extends Player>(PlayerClass: { new(...arg: any): P }): P | undefined {
    for (const player of this.__value) {
      if (player instanceof PlayerClass) return player;
    }
  }
}