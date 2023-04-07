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
    if (game.desk.allowsTransferMove({ slot, card, nextDefender: this.left })) {
      return this.makeTransferMove({ game, socket, slotIndex, card });
    }
    slot.assertAvalableForDefense({ card, trumpSuit });
    this.handlePutCardOnDesk({ game, card, slotIndex, socket });
    this.postPutCardOnDesk({ game });
  }

  private putCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.remove({ card });
    const moveContext = { player: this, slotIndex, card };
    game.round.updateCurrentMoveTo(InsertDefendCardMove, moveContext);
    game.desk.insertCard({ card, index: slotIndex });
  }

  makeTransferMove({ game, index, card }: { game: DurakGame, card: Card, index: number }): void {
    this.putTransferCard({ game, card, slotIndex: index });
    game.players.manager.makeNewDefender(this.right);
    const player = game.players.manager.makeNewAttacker(this);
    game.round.pushNextMove(AttackerMove, { player });
  }

  private postPutCardOnDesk({ game }: { game: DurakGame }): void {
    if (game.desk.isFull || !this.hand.count) {
      return game.handleSuccesfullDefense();
    }
    if (game.desk.isDefended) {
      return this.letMoveToPrimalAttacker({ game });
    }
    return game.round.pushNextMove(DefenderMove, { allowedPlayer: this });
  }

  private putTransferCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.remove({ card });
    const moveContext = { player: this, card, slotIndex };
    game.round.updateCurrentMoveTo(TransferMove, moveContext);
    game.desk.insertCard({ card, index: slotIndex });
  }

  stopMove({ game }: { game: DurakGame }): void {
    if (!game.desk.isDefended) {
      game.round.updateCurrentMoveTo(DefenderGaveUpMove, { player: this });
      return this.letPrimalAttackerMove({ game }); // PUT MORE CARDS IN PURSUIT (VDOGONKU)
    }
    game.round.updateCurrentMoveTo(StopDefenseMove, { player: this });
    if (game.desk.allowsMoves) {
      return this.letPrimalAttackerMove({ game });
    }
    return game.handleWonDefence(this);
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    assert.notStrictEqual(index, -1, "Неверный индекс");
    this.hand.value.splice(index, 1);
  }

  private letPrimalAttackerMove({ game }: { game: DurakGame }) {
    const primalAttacker = game.players.manager.makeNewAttacker(game.round.primalAttacker);
    return game.round.pushNextMove(AttackerMove, { player: primalAttacker });
  }
}
