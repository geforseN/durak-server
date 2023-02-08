import Player, { CardInsert, CardRemove } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/games.service";

export default class Defender extends Player implements CardInsert, CardRemove {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert(
    { game, slot, slotIndex, card, socket }: PlaceCardData & GameSocket,
  ): void | never {
    if (slot.defendCard) throw new Error("Карта уже побита");
    if (!slot.attackCard) throw new Error("Нет от чего защищаться");

    const { trumpSuit } = game.talon;

    if (slot.attackCard.suit === trumpSuit) {
      if (card.suit !== trumpSuit) throw new Error("Козырную карту можно побить только козырной");
      if (card.power < slot.attackCard.power) throw new Error("Вы кинули слабую карту");
    } else if (card.suit !== trumpSuit) {
      if (card.suit !== slot.attackCard.suit) throw new Error("Вы кинули неверню масть");
      if (card.power < slot.attackCard.power) throw new Error("Вы кинули слабую карту");
    }
    game.removeCard({ player: this, card, socket });
    game.insertDefendCardOnDesk({ card, index: slotIndex, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }
}