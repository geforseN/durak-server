import type Card from "@/module/DurakGame/entity/Card/index.js";

import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";

export const GOOD_CARD_AMOUNT = 6;

// NOTE: to fix nullable left and right must use null object pattern

class PlayerCards {
  constructor(
    readonly cards: Card[],
    readonly maxGoodCardsAmount: number = GOOD_CARD_AMOUNT,
  ) {}

  get isEmpty() {
    return this.cards.length === 0;
  }

  get count() {
    return this.cards.length;
  }

  get missing() {
    return Math.max(this.maxGoodCardsAmount - this.cards.length, 0);
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

  receive(...cards: Card[]) {
    return new PlayerCards([...this.cards, ...cards], this.maxGoodCardsAmount);
  }

  toJSON() {
    return this.cards.map((card) => card.toJSON());
  }
}

class Defender {
  canTakeMore(cardCount: number) {
    return this.cards.length > cardCount;
  }
}

class RoundLoser {
  constructor(private readonly defender: Defender) {}
}

class CardRecipient {
  get missing() {
    return Math.max(this.maxGoodCardsAmount - this.cards.length, 0);
  }

  receiveMissing(target) {

  }

  with(...cards: Card[]) {}
}

class MaybeNextDefender {
  readonly left: IPlayer; /* in 2 player game it is AllowedDefender, IPlayer otherwise */
  readonly right: AllowedDefender;

  canTakeMore(cardCount: number) {
    return this.cards.length > cardCount;
  }
}

class AllowedAttacker {
  perform(card: Card, slotIndex: number) {}
}

export class Player {
  #left: Player;

  get left() {
    return this.#left;
  }

  #right: Player;

  get right() {
    return this.#right;
  }

  // roles: ("admin" | "loser" | "left" | "attacker" | "defender" | "allowed")[] =
  //   [];

  constructor(
    readonly id: string,
    left: Player,
    readonly cards: PlayerCards,
    right: Player,
  ) {
    this.#left = left;
    this.#right = right;
  }

  // static clean(id: string) {
  //   return new Player(id, null, new PlayerCards([]), null);
  // }

  // static from(player: Player) {
  //   return new Player(player.id, player.left, player.cards, player.right);
  // }

  asLinked() {
    const player = Player.from(this);
    player.#left.#right = player;
    player.#right.#left = player;
    return player;
  }

  transitionTo(p) {
    this.#left.#right = p;
    this.#right.#left = p;


  }
}

export default Player;

// eslint-disable-next-line -- two slashes are cool
var a = 1

if (import.meta.vitest) {
  new Defender().isDefender() === true
}
