import assert from "node:assert";
import { CardDTO } from "../../DTO";
import { InsertAttackCardMove, StopAttackMove } from "../GameMove";
import SuperPlayer from "./SuperPlayer";
import GameRound from "../GameRound";
import Player from "./Player";

export default class Attacker extends SuperPlayer {
  constructor(player: Player) {
    super(player);
  }

  override isAttacker() {
    return true;
  }

  stopMove(round: GameRound): void {
    assert.ok(this.id === round.currentMove.player.id);
    round.currentMove.updateTo(StopAttackMove, this, {});
  }

  async putCardOnDesk(
    round: GameRound,
    { rank, suit }: CardDTO,
    slotIndex: number,
  ): Promise<void> {
    assert.ok(this.id === round.currentMove.player.id);
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    await round.game.desk.ensureCanAttack(card, slotIndex);
    round.currentMove.updateTo(InsertAttackCardMove, this,  {
      card,
      slotIndex,
    });
  }

  hasPutLastCard(round: GameRound): boolean {
    return (
      round.moves.previousMove.isInsertMove &&
      round.moves.previousMove.player.id === this.id
    );
  }
}
