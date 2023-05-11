import { GamesIO } from "../../../namespaces/games/games.types";
import { Player } from "../Players";
import Card from "../Card";
import Talon from "../Deck/Talon";

export default class GameTalonService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  provideCards({ player, cards, talon }: { player: Player, cards: Card[], talon: Talon }) {
    this.namespace.to(player.id).emit("player__receiveCards", cards);
    this.namespace.except(player.id).emit("talon__distributeCards", player.id, cards.length);
    this.namespace.except(player.id).emit("enemy__changeCardCount", player.id, player.hand.count);
    this.emitCardsRepresentation({ possibleTrumpCardReceiver: player, talon });
  }

  private emitCardsRepresentation(ctx: { possibleTrumpCardReceiver: Player, talon: Talon }) {
    if (ctx.talon.isEmpty) {
      this.moveTrumpCard({ player: ctx.possibleTrumpCardReceiver });
    } else if (ctx.talon.hasOneCard) {
      this.keepOnlyTrumpCard();
    }
  }

  private moveTrumpCard({ player }: { player: Player }) {
    this.namespace.emit("talon__moveTrumpCardTo", player.id);
  }

  private keepOnlyTrumpCard() {
    this.namespace.emit("talon__keepOnlyTrumpCard");
  }
}