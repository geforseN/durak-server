import assert from "node:assert";
import type BasePlayer from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import type Attacker from "@/module/DurakGame/entity/Player/Attacker.js";

export default class TalonDistribution {
  constructor(
    readonly talon: Talon,
    readonly players: {
      defender: BasePlayer;
      primalAttackerAsLatest: Attacker;
    },
  ) {}

  execute() {
    for (const player of this.#playersQueue()) {
      if (this.talon.isEmpty) {
        return;
      }
      this.talon.cards.provide(player);
    }
  }

  *#playersQueue() {
    const { defender, primalAttackerAsLatest } = this.players;
    assert.strictEqual(defender.right, primalAttackerAsLatest);
    yield defender.right;
    let player: BasePlayer = defender;
    while ((player = player.left) !== primalAttackerAsLatest) {
      yield player;
    }
    yield defender;
  }
}
