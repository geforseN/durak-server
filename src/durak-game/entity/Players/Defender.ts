import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../durak-game";

export default class Defender extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, slotIndex, card, socket }: PlaceCardData & GameSocket,
  ): void | never {
    const slot = game.desk.getSlot({ index: slotIndex });
    const { trumpSuit } = game.talon;
    slot.assertAvalableForDefense(card, trumpSuit);
    game.removeCard({ player: this, card, socket });
    game.insertDefendCardOnDesk({ card, index: slotIndex, socket });
  }

  stopMove({ game }: { game: DurakGame }) {
    const defender = this;
    if (game.desk.isFull) return game.handleSuccesfullDefense({ defender });
    if (!game.desk.isDefended) return game.handleBadDefense({ defender });

    // will be true when desk is defended and for EXAMPLE:
    //  lastCardCount === 4, cardCount === 6
    if (game.cardCountIncreasedFromLastDefense) {
      game.round.__lastDefenseCardCount = game.desk.cardCount;
      return game.round.__letMoveTo(game.players.tryGetAttacker());
    }
    return game.handleSuccesfullDefense({ defender });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }
}