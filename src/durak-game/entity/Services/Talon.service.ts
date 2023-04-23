import { GamesIO } from "../../../namespaces/games/games.types";
import { Player } from "../Players";
import Card from "../Card";

export default class GameTalonService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  provideCards({ player, cards }: { player: Player, cards: Card[] }) {
    this.namespace.to(player.id).emit("player__receiveCards", cards);
    this.namespace.except(player.id).emit("talon__distributeCards", player.id, cards.length);
    this.namespace.except(player.id).emit("enemy__changeCardCount", player.id, player.hand.count);
  }

  moveTrumpCard({ player }: { player: Player }) {
    this.namespace.emit("talon__moveTrumpCardTo", player.id);
  }
}