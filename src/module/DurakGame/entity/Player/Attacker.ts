import assert from "node:assert";
import { CardDTO } from "../../DTO";
import type DurakGame from "../../DurakGame.implimetntation";
import Card from "../Card";
import { GameMove, InsertAttackCardMove, StopAttackMove } from "../GameMove";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  stopMove(move: GameMove): void {
    move.updateTo(StopAttackMove);
  }

  async putCardOnDesk(
    move: GameMove,
    { rank, suit }: CardDTO,
    slotIndex: number,
  ): Promise<void> {
    assert.ok(move === move.game.round.currentMove);
    move.defaultBehavior.stop();
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    await move.game.desk.ensureCanAttack(card, slotIndex);
    move.updateTo(InsertAttackCardMove, {
      card,
      slotIndex,
    });
  }

  hasPutLastCard(game: DurakGame): boolean {
    return (
      game.round.moves.previousMove.isInsertMove &&
      game.round.moves.previousMove.player === this
    );
  }

  override get isAttacker() {
    return true;
  }
}
