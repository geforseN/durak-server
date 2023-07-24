import assert from "node:assert";
import type DurakGame from "../../DurakGame.implimetntation";
import { type CanReceiveCards } from "../../DurakGame.implimetntation";
import type Card from "../Card";
import SuperPlayer from "./SuperPlayer";
import type DefenderMove from "../GameMove/Defender/DefenderMove";
import {
  InsertDefendCardMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";
import { CardDTO } from "../../DTO";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  async putCardOnDesk(
    move: DefenderMove,
    { rank, suit }: CardDTO,
    slotIndex: number,
  ) {
    assert.ok(this === move.player);
    assert.ok(move === move.game.round.currentMove);
    move.defaultBehavior.stop();
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    // TODO remove move.allowsTransferMove
    // TODO add move.updateToInsertCardMove()
    if (await move.game.desk.allowsTransferMove(this, card, slotIndex)) {
      move.updateTo(TransferMove, { card, slotIndex });
    } else {
      await move.game.desk.slotAt(slotIndex)?.ensureCanBeDefended(card);
      move.updateTo(InsertDefendCardMove, { card, slotIndex });
    }
  }

  stopMove(move: DefenderMove) {
    assert.ok(this === move.player);
    move.updateTo(StopDefenseMove);
  }

  canDefend(cardCount: number) {
    return this.canTakeMore(cardCount);
  }

  canWinDefense(game: DurakGame) {
    try {
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        this.left === game.round.primalAttacker ||
        // below statement is for more than 2 players game
        game.players.attacker.left === game.round.primalAttacker
      );
    } catch {
      return false;
    }
  }

  override get isDefender() {
    return true;
  }
}
