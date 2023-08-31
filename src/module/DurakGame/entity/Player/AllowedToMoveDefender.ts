import assert from "node:assert";
import DurakGame from "../../DurakGame";
import {
  BaseDefenderMove,
  InsertDefendCardMove,
  StopDefenseMove,
  DefenderTransferMove,
} from "../GameMove";
import Defender from "./Defender";
import { CanMakeMove, CanMakeTransferMove } from "./Player";
import Card from "../Card";
import { CardDTO } from "../../DTO";

export default class AllowedToMoveDefender
  extends Defender
  implements CanMakeMove, CanMakeTransferMove
{
  game;

  __stopDefense = undefined;
  __defendSlot = undefined;
  __giveUp = undefined;

  __defaultBehavior__ = undefined

  // NOTE: AllowedDefender should have methods:
  // - putCardOnDesk;
  // - stopMove
  // - makeTransferMove
  constructor(defender: Defender, game: DurakGame) {
    super(defender);
    this.game = game;
  }

  override isAllowedToMove(): this is CanMakeMove {
    return true;
  }

  makeBaseMove(): BaseDefenderMove {
    return new BaseDefenderMove(this.game, this);
  }

  makeTransferMove(card: Card, slotIndex: number) {
    return new DefenderTransferMove(this.game, this, { card, slotIndex });
  }

  async makeInsertMove({ rank, suit }: CardDTO, slotIndex: number) {
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    if (await this.canMakeTransferMove(card, slotIndex)) {
      return this.makeTransferMove(card, slotIndex);
    }
    await this.game.desk.slotAt(slotIndex).ensureCanBeDefended(card);
    return new InsertDefendCardMove(this.game, this, {
      card,
      slotIndex,
    });
  }

  makeStopMove() {
    return new StopDefenseMove(this.game, this);
  }

  async canMakeTransferMove(card: Card, slotIndex: number): Promise<boolean> {
    return (
      this.left.canTakeMore(this.game.desk.cardsCount) &&
      this.game.desk.allowsTransferMove(card, slotIndex)
    );
  }
}
