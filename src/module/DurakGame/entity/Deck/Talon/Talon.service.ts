import { DurakGameSocket } from "@durak-game/durak-dts";
import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";

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
