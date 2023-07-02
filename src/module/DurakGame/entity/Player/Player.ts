import { Hand } from "../Deck";
import Card from "../Card";
import GamePlayerService from "./Player.service";
import { LobbyUser } from "../../../Lobbies/lobbies.namespace";

export const GOOD_CARD_AMOUNT = 6 as const;
const allowedMissingCardCount = [0, 1, 2, 3, 4, 5, 6] as const;
export type AllowedMissingCardCount = (typeof allowedMissingCardCount)[number];
export const playerKinds = ["Defender", "Attacker", "Player"] as const;
export type PlayerKind = (typeof playerKinds)[number];

export default class Player {
  info!: LobbyUser;
  hand!: Hand;
  left!: Player;
  right!: Player;
  index!: number;
  protected service?: GamePlayerService;

  constructor(arg: LobbyUser);
  constructor(arg: Player);
  constructor(arg: LobbyUser | Player) {
    if (arg instanceof Player) {
      this.hand = arg.hand;
      this.info = arg.info;
      this.left = arg.left;
      this.right = arg.right;
      this.index = arg.index;
      this.service = arg.service;
      this.left.right = this;
      this.right.left = this;
    } else {
      this.hand = new Hand();
      this.info = arg;
    }
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(...cards);
    this.service?.receiveCards({ player: this, cards });
  }

  get id(): string {
    return this.info.id;
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  canTakeMore(cardCount: number) {
    return this.hand.count > cardCount;
  }

  injectService(playerService: GamePlayerService) {
    this.service = playerService;
  }

  static hasSameId(this: { id: string }, player: Player) {
    return this.id === player.id;
  }

  get isDefender() {
    return false;
  }

  get isAttacker() {
    return false;
  }

  get isSuperPlayer() {
    return this.isAttacker || this.isDefender;
  }
}
