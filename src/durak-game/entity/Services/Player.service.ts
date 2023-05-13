import { GamesIO } from "../../../namespaces/games/games.types";
import { Player } from "../Players";
import Card from "../Card";

export default class GamePlayerService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  receiveCards({ player, cards }: { player: Player, cards: Card[] }) {
    this.namespace.to(player.id).emit("player__receiveCards", cards);
    this.namespace.except(player.id).emit("enemy__changeCardCount", player.id, player.hand.count);
  }

  removeCard({ player, card }: { player: Player, card: Card }) {
    this.namespace.to(player.id).emit("self__removeCard", card);
    this.namespace.except(player.id).emit("enemy__changeCardCount", player.id, player.hand.count);
  }
}