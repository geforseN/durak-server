import Attacker from "../../Player/Attacker";
import { GameMove } from "../GameMove.abstract";
import Card from "../../Card";
import DurakGame from "../../../DurakGame.implimetntation";

export class AttackerMove extends GameMove<Attacker> {
  defaultBehaviour: NodeJS.Timeout;
  defaultBehaviourCallTimeInUTC: number;

  constructor(arg: { game: DurakGame; player: Attacker }) {
    super(arg);
    this.defaultBehaviourCallTimeInUTC = Date.now() + this.game.settings.moveTime;
    this.defaultBehaviour = this.#defaultBehaviour();
  }

  #defaultBehaviour() {
    console.log("#defaultBehaviour AttackerMove");
    console.log(Object.getPrototypeOf(this).name);
    return setTimeout(async () => {
      console.log("TIMEOUT: defaultBehaviour called");
      if (this.game.desk.isEmpty) {
        console.log("TIMEOUT: insertRandomCard");
        return await this.#insertRandomCardOfPlayer();
      }
      console.log("TIMEOUT: stopMove");
      return this.stopMove();
    }, this.game.settings.moveTime);
  }

  async #insertRandomCardOfPlayer() {
    return await this.putCardOnDesk(
      this.player.randomCard,
      this.game.desk.slots.ramdomSlotIndex,
    );
  }

  override get player(): Attacker {
    const attacker = super.player;
    assert.ok(attacker instanceof Attacker);
    return attacker;
  }

  override async putCardOnDesk(card: Card, slotIndex: number) {
    await this.game.desk.ensureCanAttack(card, slotIndex);
    this.game.round.makeAttackInsertMove(card, slotIndex);
  }

  override stopMove() {
    this.game.round.makeAttackStopMove();
  }

  allowsTransferMove() {
    return Promise.reject(new Error("Атакующий не может перевести карту"));
  }
}
