import assert from "node:assert";
import GameMove from "../GameMove.abstract";
import Attacker from "../../Player/Attacker";
import type DurakGame from "../../../DurakGame.implimetntation";
import type Card from "../../Card";
import { StopAttackMove } from "./StopAttackMove";
import { InsertAttackCardMove } from "./InsertAttackCardMove";
import { type Player } from "../../Player";
import { AttackerMoveDefaultBehavior } from "./AttackerMoveDefaultBehavior";

export class AttackerMove extends GameMove {
  readonly performer: Attacker;
  readonly defaultBehavior: AttackerMoveDefaultBehavior

  constructor(game: DurakGame, movePerformer: Player = game.players.attacker) {
    super(game);
    this.game.players.attacker = movePerformer;
    this.performer = this.game.players.attacker;
    this.defaultBehavior = new AttackerMoveDefaultBehavior(this);
  }

  async putCardOnDesk(card: Card, slotIndex: number) {
    assert.ok(this === this.game.round.currentMove);
    this.defaultBehavior.stop()
    await this.game.desk.ensureCanAttack(card, slotIndex);
    this.updateTo(InsertAttackCardMove, {
      card,
      slotIndex,
    });
  }

  stopMove() {
    this.defaultBehavior.stop()
    this.updateTo(StopAttackMove);
  }

  async allowsTransferMove() {
    return Promise.reject(new Error("Атакующий не может перевести карту"));
  }
}
export default AttackerMove;
