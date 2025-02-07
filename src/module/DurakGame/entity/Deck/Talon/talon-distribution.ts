import assert from "node:assert";
import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import type Attacker from "@/module/DurakGame/entity/Player/Attacker.js";

export default class TalonDistribution {
  constructor(
    readonly talon: Talon,
    readonly players: {
      defender: Player;
      primalAttackerAsLatest: Attacker;
    },
  ) {}

  execute() {
    if (this.talon.isEmpty()) {
      return
    }
    for (const player of this.#playersQueue()) {
      const cards = this.talon.pop(player.cards.missing);
      player.cards
      if (this.talon.isEmpty()) {
        return
      }
    }
  }

  *#playersQueue() {
    const { defender, primalAttackerAsLatest } = this.players;
    assert.strictEqual(defender.right, primalAttackerAsLatest);
    yield defender.right;
    let player: Player = defender;
    while ((player = player.left) !== primalAttackerAsLatest) {
      yield player;
    }
    yield defender;
  }
}
