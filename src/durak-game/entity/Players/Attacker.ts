import Player, { CardInsert, CardRemove } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";

export default class Attacker extends Player implements CardInsert, CardRemove {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert(
    { game, card, slot, slotIndex, socket }: PlaceCardData & GameSocket,
  ): void | never {
    if (!game.desk.isEmpty) {
      if (slot.attackCard) throw new Error("Занято");
      if (!game.desk.hasCardWithRank(card.rank)) throw new Error("Нет схожего ранга на доске");
    }
    game.removeCard({ player: this, card, socket });
    game.insertAttackCardOnDesk({ index: slotIndex, card, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }
}