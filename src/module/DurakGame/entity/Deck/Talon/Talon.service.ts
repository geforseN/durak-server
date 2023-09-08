import { DurakGameSocket } from "@durak-game/durak-dts";
import { BasePlayer } from "../../Player/BasePlayer.abstract.js";
import Card from "../../Card/index.js";
import Talon from "./index.js";

export default class GameTalonWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  provideCardsAnimation(talon: Talon, player: BasePlayer, cards: Card[]) {
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
