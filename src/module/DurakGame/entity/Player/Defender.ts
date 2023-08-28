import assert from "node:assert";
import { type CanReceiveCards } from "../../DurakGame";
import SuperPlayer from "./SuperPlayer";
import {
  InsertDefendCardMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";
import { CardDTO } from "../../DTO";
import GameRound from "../GameRound";
import Card from "../Card";
import type Player from "./Player";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  isGaveUp: boolean;

  constructor(player: Player) {
    super(player);
    this.isGaveUp = false;
  }

  override isDefender() {
    return true;
  }

  async putCardOnDesk(
    round: GameRound,
    { rank, suit }: CardDTO,
    slotIndex: number,
  ) {
    assert.ok(this === round.currentMove.player);
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    if (await this.canMakeTransferMove(round, card, slotIndex)) {
      return round.currentMove.updateTo(TransferMove, this, { card, slotIndex });
    }
    await round.game.desk.slotAt(slotIndex).ensureCanBeDefended(card);
    return round.currentMove.updateTo(InsertDefendCardMove, this, {
      card,
      slotIndex,
    });
  }

  // TODO add ensureCanDefend(unbeatenDeskCards)
  // TODO add ensureCanMakeTransferMove(desk)

  stopMove(round: GameRound) {
    assert.ok(this === round.currentMove.player);
    round.currentMove.updateTo(StopDefenseMove, this, {});
  }

  canDefend(cardCount: number) {
    return this.canTakeMore(cardCount);
  }

  canWinDefense(round: GameRound) {
    try {
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        this.left === round.primalAttacker ||
        // below statement is for more than 2 players game
        round.game.players.attacker.left === round.primalAttacker
      );
    } catch {
      return false;
    }
  }

  async canMakeTransferMove(round: GameRound, card: Card, slotIndex: number) {
    return (
      this.left.canTakeMore(round.game.desk.cardsCount) &&
      round.game.desk.allowsTransferMove(card, slotIndex)
    );
  }
}
