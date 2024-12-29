import assert from "node:assert";

import type { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";
import type { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import type { Defender } from "@/module/DurakGame/entity/Player/Defender.js";


export class SettledPlayers {
  // here will be primal attacker

  // here will be primal defender
}

export class Players {
  readonly #value: BasePlayer[];

  constructor(value: BasePlayer[]) {
    this.#value = value;
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  find(cb: (_player: BasePlayer) => boolean) {
    return this.#value.find(cb);
  }

  get(
    _cb: (_player: BasePlayer) => boolean,
    _notFoundMessage?: string,
  ): BasePlayer;

  get<PlayerToFind extends BasePlayer>(
    _cb: (p: BasePlayer) => p is PlayerToFind,
    _notFoundMessage?: string,
  ): PlayerToFind;

  get(
    cb: (_player: BasePlayer) => boolean,
    notFoundMessage = "Игрок не найден",
  ): BasePlayer {
    const player = this.#value.find(cb);
    assert.ok(player, notFoundMessage);
    return player;
  }

  mutateWith(updatedPlayer: BasePlayer) {
    const player: BasePlayer | never = this.get(
      (player) => player.id === updatedPlayer.id,
    );
    const index = this.#value.indexOf(player);
    this.#value[index] = updatedPlayer;
    updatedPlayer.becomeUpdated(player);
    return this;
  }

  with(player: BasePlayer) {
    const linkedPlayer = player.asLinked()
    const index = this.#value.indexOf(player);
    const players = this.#value.with(index, linkedPlayer);
    return new Players(players);
  }

  remove(
    cb: (_player: BasePlayer) => boolean,
    notRemovedMessage?: string,
  ): BasePlayer {
    const playerIndex = this.#value.findIndex(cb);
    assert.ok(playerIndex, notRemovedMessage);
    const [player] = this.#value.splice(playerIndex, 1);
    return player;
  }

  get allowed() {
    const allowedPlayers = this.#value.filter((player) => player.isAllowed());
    assert.ok(allowedPlayers.length === 1);
    const allowedPlayer = allowedPlayers[0];
    assert.ok(allowedPlayer.isAllowed() && allowedPlayer.isSuperPlayer());
    return allowedPlayer;
  }

  get attacker(): Attacker {
    return this.get<Attacker>(
      (player): player is Attacker => player.isAttacker(),
      "Атакующий не найден",
    );
  }

  get count() {
    return this.#value.length;
  }

  get defender(): Defender {
    return this.get<Defender>(
      (player): player is Defender => player.isDefender(),
      "Защищающийся не найден",
    );
  }
}

export default Players;
