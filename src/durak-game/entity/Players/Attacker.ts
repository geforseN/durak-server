import Player from "./Player";
import { CardInsert, PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";
import { GamesIO } from "../../../namespaces/games/games.types";
import Card from "../Card";

export default class Attacker extends Player implements CardInsert {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert(
    { game, card, slot, slotIndex, socket }: PlaceCardData & { socket: GamesIO.SocketIO },
  ): void | never {
    const { desk } = game;
    if (!desk.isEmpty) {
      if (slot.attackCard) throw new Error("Занято");
      if (!desk.hasCardWithRank(card.rank)) throw new Error("Нет схожего ранга на доске");
    }
    this.removeCard(card);
    socket.to(socket.data.accname as string).emit("self__removeCard", card);
    game.gameService.changeCardCount({ accname: socket.data.accname as string, cardCount: this.hand.count, socket });
    game.insertAttackCardOnDesk({ index: slotIndex, card, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }
}