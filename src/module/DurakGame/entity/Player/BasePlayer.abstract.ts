import type Card from "@/module/DurakGame/entity/Card/index.js";
import type { AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";
import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";
import type { Defender } from "@/module/DurakGame/entity/Player/Defender.js";
import type { SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import type { UserProfile } from "@durak-game/durak-dts";

export const GOOD_CARD_AMOUNT = 6;

class PlayerCards {
  constructor(
    readonly cards: Card[],
    readonly maxCards: number = GOOD_CARD_AMOUNT,
  ) {}

  get isEmpty() {
    return this.cards.length === 0;
  }

  get count() {
    return this.cards.length;
  }

  get max() {
    return this.maxCards;
  }

  get missing() {
    return Math.max(this.max - this.cards.length, 0);
  }

  /* FIXME: only for primal defender or when non primal defender tries to make transfer for the left  */
  canTakeMore(cardCount: number) {
    return this.cards.length > cardCount;
  }

  ensureCanTakeMore(cardCount: number) {
    if (this.canTakeMore(cardCount)) {
      return;
    }
    throw new AllowedPlayerBadInputError(
      "Player, to which you wanna transfer cards, has not enough card for defense. You must defend cards on desk",
      {
        header: "Transfer move attempt",
      },
    );
  }

  toJSON() {
    return this.cards.map((card) => card.toJSON());
  }
}

export class BasePlayer {
  #left: BasePlayer;

  get left() {
    return this.#left;
  }

  #right: BasePlayer;

  get right() {
    return this.#right;
  }

  // roles: ("admin" | "loser" | "left" | "attacker" | "defender" | "allowed")[] =
  //   [];

  constructor(
    readonly id: string,
    readonly profile: UserProfile,
    left: BasePlayer,
    readonly cards: PlayerCards,
    right: BasePlayer,
  ) {
    this.#left = left;
    this.#right = right;
  }

  static clean(id: string, profile: UserProfile) {
    return new BasePlayer(id, profile, null, new PlayerCards([]), null);
  }

  static from(player: BasePlayer) {
    return new BasePlayer(
      player.id,
      player.profile,
      player.left,
      player.cards,
      player.right,
    );
  }

  asLinked() {
    const player = BasePlayer.from(this);
    player.#left.#right = player;
    player.#right.#left = player;
    return player;
  }

  isAllowed(): this is AllowedSuperPlayer {
    return false;
  }

  isAllowedAttacker(): this is AllowedAttacker {
    return this.isAttacker() && this.isAllowed();
  }

  isAllowedDefender(): this is AllowedDefender {
    return this.isDefender() && this.isAllowed();
  }

  isAttacker(): this is Attacker {
    return false;
  }

  isDefender(): this is Defender {
    return false;
  }

  isSuperPlayer(): this is SuperPlayer {
    return this.isAttacker() || this.isDefender();
  }
}

export default BasePlayer;
