import { DurakGameSocket } from "@durak-game/durak-dts";
import { Player } from "../../__Player";
import Card from "../../Card";
import Talon from "./index";

export default class GameTalonWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  provideCardsAnimation(talon: Talon, player: Player, cards: Card[]) {
    this.namespace.emit("talon::madeDistribution", {
      receiver: {
        id: player.id,
      },
      distributionCards: {
        count: cards.length,
        isMainTrumpCardIncluded: !!cards.length && talon.isEmpty,
      },
      talon: {
        cardCount: talon.count,
        isOnlyTrumpCardRemained: talon.hasOneCard,
      },
    });
  }
}
