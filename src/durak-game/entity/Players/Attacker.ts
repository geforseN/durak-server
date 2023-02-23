import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame, { CardInfo } from "../../durak-game";
import { AttackerMove, DefenderMove, InsertAttackCardMove, StopAttackMove } from "../../GameRound";

export type AttackerO = { attacker: Attacker };

export default class Attacker extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, card, slotIndex: index, socket }: PlaceCardData & GameSocket,
  ): void | never {
    const slot = game.desk.getSlot({ index });
    if (!slot.isEmpty) {
      if (slot.attackCard) throw new Error("Слот занят");
      if (!game.desk.hasCardWithRank(card.rank)) {
        throw new Error("Нет схожего ранга на доске");
      }
    }
    game.removeFromHand({ player: this, card, socket });
    game.insertCardOnDesk({ index, card, socket });
    this.postPutCardOnDesk({ game, card, index });
  }

  private postPutCardOnDesk({ game, card, index }: { game: DurakGame } & CardInfo) {
    game.round.updateCurrentMoveTo(InsertAttackCardMove, { allowedPlayer: this, card, slotIndex: index });
    const defender = game.players.tryGetDefender();
    const deskCardCount = game.desk.cardCount;

    const canDefenderTakeCard = defender.hand.count > game.desk.unbeatenCardCount;
    if (!canDefenderTakeCard) {
      game.round.pushNextMove(StopAttackMove, { allowedPlayer: this, deskCardCount });
      game.round.pushNextMove(DefenderMove, { allowedPlayer: defender, deskCardCount });
    } /* else if (!this.hand.count) {
      !!! UPD: probably no need this if statement !!!
      pushNextMoveToNextAttackerORMaybeDefender
    } */
    else {
      game.round.pushNextMove(AttackerMove, { allowedPlayer: this });
    }
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  stopMove({ game }: { game: DurakGame }) {

  }
}
