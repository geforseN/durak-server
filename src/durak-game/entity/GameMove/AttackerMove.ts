import Attacker from "../Players/Attacker";
import { GameMove } from "./GameMove";
import { randomInt } from "node:crypto";

export class AttackerMove extends GameMove<Attacker> {
  defaultBehaviour: NodeJS.Timeout

  constructor(arg: {game: DurakGame, player: Attacker}) {
    super(arg);
    this.defaultBehaviour = this.#defaultBehaviour();
  }

  #defaultBehaviour() {
    return setTimeout(async () => {
      if (this.game.desk.isEmpty) {
        return await this.#insertRandomCard();
      }
      return this.player.stopMove({ game: this.game });
    }, this.game.settings.moveTime);
  }

  private async insertRandomCard() {
    await this.player.putCardOnDesk({
      game: this.game,
      card: this.randomCard,
      index: this.randomSlotIndex,
    });
  }

  private get randomCard() {
    return this.player.hand.value[this.player.randomCardIndex];
  }

  private get randomSlotIndex() {
    return randomInt(0, this.game.desk.slots.length);
  }
}