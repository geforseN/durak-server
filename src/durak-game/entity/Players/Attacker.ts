import Player from "./Player";
import { CardInsert, PlaceCardData } from "../../../namespaces/games/methods/handle-place.card";

export default class Attacker extends Player implements CardInsert {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert({ game, card, slot, slotIndex }: PlaceCardData): void | never {
    const { desk } = game;
    if (desk.isEmpty) return game.insertAttackCard({ card, index: slotIndex });
    if (slot.hasAttackCard) throw new Error("Занято");
    if (!desk.hasCardWithRank(card.rank)) throw new Error("Нет схожего ранга на доске");
    desk.insertAttackerCard({ index: slotIndex, card });
  }
}