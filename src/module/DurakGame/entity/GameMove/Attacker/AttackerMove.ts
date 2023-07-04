import assert from "node:assert";
import GameMove from "../GameMove.abstract";
import Attacker from "../../Player/Attacker";
import type DurakGame from "../../../DurakGame.implimetntation";
import type Card from "../../Card";

export class AttackerMove extends GameMove<Attacker> {
  readonly defaultBehaviour: NodeJS.Timeout;
  readonly defaultBehaviourCallTimeInUTC: number;

  constructor({ game, player }: { game: DurakGame; player: Attacker }) {
    super({ game, player });
    this.defaultBehaviourCallTimeInUTC =
      Date.now() + this.game.settings.moveTime;
    this.defaultBehaviour = this.#defaultBehaviour();
  }

  #defaultBehaviour() {
    console.log("#defaultBehaviour of AttackerMove", this.constructor.name);
    return setTimeout(async () => {
      console.log("TIMEOUT: defaultBehaviour called");
      assert.ok(this.player instanceof Attacker);
      console.log("TIMEOUT: insertRandomCard");
      await this.putCardOnDesk(
        this.player.randomCard,
        this.game.desk.randomEmptySlotIndex,
      );
    }, this.game.settings.moveTime);
  }

  async putCardOnDesk(card: Card, slotIndex: number) {
    await this.game.desk.ensureCanAttack(card, slotIndex);
    this.game.round.makeAttackInsertMove(card, slotIndex);
  }

  stopMove() {
    this.game.round.makeAttackStopMove();
  }

  async allowsTransferMove() {
    return Promise.reject(new Error("Атакующий не может перевести карту"));
  }
}
export default AttackerMove;
