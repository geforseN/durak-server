import { GamesIO } from "../../../namespaces/games/games.types";
import { Player } from "../Players";
import Card from "../entity/Card";
import Talon from "../Deck/Talon";

export default class GameTalonService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  provideCardsAnimation({ player, cards, talon }: { player: Player, cards: Card[], talon: Talon }) {
    this.namespace.except(player.id).emit("talon__distributeCardsTo", player.id, cards.length);
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