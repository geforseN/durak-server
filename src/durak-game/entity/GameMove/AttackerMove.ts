import Attacker from "../Players/Attacker";
import { GameMove } from "./GameMove";
import Card from "../Card";
import DurakGame from "../../DurakGame";

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

  async #insertRandomCard() {
    return await this.putCardOnDesk(
      this.player.randomCard,
      this.game.desk.randomSlotIndex,
    );
  }

  async putCardOnDesk(card: Card, slotIndex: number) {
    await this.game.desk.ensureCanAttack({ card, index: slotIndex });
    this.player.remove({ card });
    this.game.round.makeAttackInsertMove(card, slotIndex);
  }
}