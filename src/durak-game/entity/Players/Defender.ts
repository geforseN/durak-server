import assert from "node:assert";
import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import Card from "../Card";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../DurakGame";
import {
  AttackerMove,
  DefenderMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";

export default class Defender extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk({ game, slotIndex, card, socket }: PlaceCardData & GameSocket): void | never {
    const slot = game.desk.getSlot({ index: slotIndex });
    const { trumpSuit } = game.talon;
    if (game.allowsTransferMove({ slot, card, possibleDefender: this.left })) {
      return this.makeTransferMove({ game, socket, slotIndex, card });
    }
    slot.assertAvalableForDefense({ card, trumpSuit });
    this.handlePutCardOnDesk({ game, card, slotIndex, socket });
    this.postPutCardOnDesk({ game });
  }

  private handlePutCardOnDesk({ game, card, slotIndex, socket }: PlaceCardData & GameSocket): void {
    game.removeFromHand({ player: this, card, socket });
    const InsertCardMove = this.getInsertCardMove({ game, slotIndex });
    game.round.updateCurrentMoveTo(InsertCardMove, { allowedPlayer: this, slotIndex, card });
    game.insertCardOnDesk({ card, index: slotIndex, socket });
  }

  private makeTransferMove({ game, slotIndex, card, socket }: PlaceCardData & GameSocket): void {
    game.round.updateCurrentMoveTo(TransferMove, { allowedPlayer: this, card, slotIndex });
    this.handlePutCardOnDesk({ game, card, socket, slotIndex });
    game.makeDefender(this.right);
    const allowedPlayer = game.makeAttacker(this);
    game.round.pushNextMove(AttackerMove, { allowedPlayer });
  }

  private postPutCardOnDesk({ game }: { game: DurakGame }): void {
    if (game.desk.isFull || !this.hand.count) {
      return game.handleSuccesfullDefense();
    }
    if (game.desk.isDefended) {
      return this.giveNextMoveToOriginalAttacker({ game });
    }
    return game.round.pushNextMove(DefenderMove, { allowedPlayer: this });
  }

  stopMove({ game }: { game: DurakGame }): void {
    game.round.updateCurrentMoveTo(StopDefenseMove, { allowedPlayer: this });
    if (!game.desk.isDefended) {
      return game.handleBadDefense();
    }
    if (game.cardCountIncreasedFromLastDefense) {
      return this.giveNextMoveToOriginalAttacker({ game });
    }
    return game.handleSuccesfullDefense();
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    assert.notStrictEqual(index, -1, "Неверный индекс");
    this.hand.value.splice(index, 1);
  }

  private makeOriginalAttacker({ game }: { game: DurakGame }) {
    console.log(game.round._tryOriginalAttacker_, game.round.originalAttacker); // TODO: DELETE AFTER TEST
    game.round.originalAttacker = game.players.tryGetAttacker();
  }

  private giveNextMoveToOriginalAttacker({ game }: { game: DurakGame }) {
    assert.ok(game.round.originalAttacker);
    const originalAttacker = game.makeAttacker(game.round.originalAttacker);
    console.log("GIVE MOVE TO ORIG ATT", originalAttacker.info.accname);
    return game.round.pushNextMove(AttackerMove, { allowedPlayer: originalAttacker });
  }

  private getInsertCardMove({ game, slotIndex: index }: { game: DurakGame, slotIndex: number }) {
    return game.desk.getSlot({ index }).isEmpty ? InsertAttackCardMove : InsertDefendCardMove;
  }
}
