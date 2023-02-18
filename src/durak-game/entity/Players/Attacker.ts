import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../durak-game";

export default class Attacker extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, card, slotIndex, socket }: PlaceCardData & GameSocket,
  ): void | never {
    game.desk.assertCanPut({ attackCard: card, slotIndex });
    game.removeCard({ player: this, card, socket });
    game.insertAttackCardOnDesk({ index: slotIndex, card, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  stopMove({ game }: { game: DurakGame }) {
    const isOriginalAttacker = game.round.__isOriginalAttacker(this);
    const sameCardCount = game.cardCountSameFromLastDefense;
    const defender = game.round.__originalDefender;

    if (this.hand.count === 0) {
      if (isOriginalAttacker) return FIXME_LetMoveToNextPlayer(this)
      return FIXME_LetMoveToNextPlayer(this);
    }
    // game.cardCountIncreasedFromLastDefense;

    // ORIGINAL ATTACKER
    // cardCount 4, lastDefenseCardCount 2      letMoveToDefender
    // cardCount 2, lastDefenseCardCount 2      LOOP HERE :(
    // cardCount 2, lastDefenseCardCount null   letMoveToDefender

    // NOT ORIGINAL ATTACKER
    // cardCount 4, lastDefenseCardCount 2      letMoveToDefender  IF DEFENDER SUCCEEDED MAKE MOVE TO THIS ???
    // cardCount 2, lastDefenseCardCount 2      letMoveTo(this.left) LOOP HERE :(( IF this.left === original DEFENDER WON
    // cardCount 2, lastDefenseCardCount null   letMoveTo(this.left) LOOP HERE :(((


    if (isOriginalAttacker) {
      if (sameCardCount) {
        return FIXME_LetMoveToNextPlayer(this);
      } else return game.round.__letMoveTo(defender);
    }
    if (sameCardCount) {
      game.makePlayer(this);
      const newAttacker = game.makeAttacker(defender.left);
      if (game.round.__isOriginalAttacker(newAttacker)) {
        return game.handleSuccesfullDefense({ defender });
      }
      return game.letMoveTo(newAttacker);
    } else return game.round.__letMoveTo(defender);

    function FIXME_LetMoveToNextPlayer(p: Attacker) {
      game.makePlayer(p);
      const newAttacker = game.makeAttacker(defender.left);
      return game.letMoveTo(newAttacker);
    }
  }
}
