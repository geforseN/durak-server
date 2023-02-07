import Player from "./Player";
import { CardInsert, PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";
import { GamesIO } from "../../../namespaces/games/games.types";
import Card from "../Card";

export default class Defender extends Player implements CardInsert {
  constructor(player: Player) {
    super(player);
  }

  handleCardInsert(
    { game, slot, slotIndex, card, socket }: PlaceCardData & { socket: GamesIO.SocketIO },
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
    this.removeCard(card);
    socket.to(socket.data.accname as string).emit("self__removeCard", card);
    game.gameService.changeCardCount({ accname: socket.data.accname as string, cardCount: this.hand.count, socket });
    game.insertDefendCardOnDesk({ card, index: slotIndex, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }
}