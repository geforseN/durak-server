import assert from "node:assert";
import { BasePlayer } from "../Player/BasePlayer.abstract";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract";
import { type Attacker } from "../Player/Attacker";
import { type Defender } from "../Player/Defender";

export class Players {
  readonly value: BasePlayer[];

  constructor(value: BasePlayer[]) {
    this.value = value;
  }

  *[Symbol.iterator]() {
    yield* this.value;
  }

  get count() {
    return this.value.length;
  }

  with(updatedPlayer: BasePlayer) {
    const player: BasePlayer | never = this.get(
      (player) => player.id === updatedPlayer.id,
    );
    const index = this.value.indexOf(player);
    return new Players(this.value.with(index, player));
  }

  get #allowedPlayer() {
    return this.get<AllowedSuperPlayer>(
      (player): player is AllowedSuperPlayer => player.isAllowed(),
      "Разрешенный игрок не найден",
    );
  }

  // TODO change body of method to this.#allowedPlayer body
  // should change it when this.allowedPlayer will never throw
  get allowedPlayer() {
    const allowedPlayers = this.value.filter((player) => player.isAllowed());
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

  get defender(): Defender {
    return this.get<Defender>(
      (player): player is Defender => player.isDefender(),
      "Защищающийся не найден",
    );
  }

  get(
    cb: (player: BasePlayer) => boolean,
    notFoundMessage?: string,
  ): BasePlayer;
  get<PlayerToFind extends BasePlayer>(
    cb: (p: BasePlayer) => p is PlayerToFind,
    notFoundMessage?: string,
  ): PlayerToFind;
  get(
    cb: (player: BasePlayer) => boolean,
    notFoundMessage = "Игрок не найден",
  ): BasePlayer {
    const player = this.value.find(cb);
    assert.ok(player, notFoundMessage);
    return player;
  }

  remove(
    cb: (player: BasePlayer) => boolean,
    notRemovedMessage?: string,
  ): BasePlayer {
    const playerIndex = this.value.findIndex(cb);
    assert.ok(playerIndex, notRemovedMessage);
    const [player] = this.value.splice(playerIndex, 1);
    return player;
  }
}
