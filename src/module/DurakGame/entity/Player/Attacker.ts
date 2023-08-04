import assert from "node:assert";
import { CardDTO } from "../../DTO";
import { InsertAttackCardMove, StopAttackMove } from "../GameMove";
import SuperPlayer from "./SuperPlayer";
import GameRound from "../GameRound";

export default class Attacker extends SuperPlayer {
  stopMove(round: GameRound): void {
    assert.ok(this === round.currentMove.player);
    round.currentMove.updateTo(StopAttackMove);
  }

  async putCardOnDesk(
    round: GameRound,
    { rank, suit }: CardDTO,
    slotIndex: number,
  ): Promise<void> {
    "TODO ensure can't make transfer move" &&
      Promise.reject(new Error("Атакующий не может перевести карту"));
    assert.ok(this === round.currentMove.player);
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    await round.game.desk.ensureCanAttack(card, slotIndex);
    round.currentMove.updateTo(InsertAttackCardMove, {
      card,
      slotIndex,
    });
  }

  hasPutLastCard(round: GameRound): boolean {
    return (
      round.moves.previousMove.isInsertMove &&
      round.moves.previousMove.player === this
    );
  }

  override get isAttacker() {
    return true;
  }
}
