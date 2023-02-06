import Player from "./Player";
import { CardInsert, PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";

export default class Defender extends Player implements CardInsert {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert({ game, slot, slotIndex, card }: PlaceCardData): void | never {
    if (slot.hasDefendCard) throw new Error("Карта уже побита");
    if (!slot.attackCard) throw new Error("Нет от чего защищаться");

    if (slot.hasTrumpAttackCard({ game })) {
      if (!card.isTrump({ game })) throw new Error("Козырную карту можно побить только козырной");
      if (card.power < slot.attackCard.power) throw new Error("Вы кинули слабую карту");
    } else if (!card.isTrump({ game })) {
      if (card.suit !== slot.attackCard.suit) throw new Error("Вы кинули неверню масть");
      if (card.power < slot.attackCard.power) throw new Error("Вы кинули слабую карту");
    }

    game.insertDefendCard({ card, index: slotIndex });
  }
}