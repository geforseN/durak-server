import { Hand } from "../Deck";
import Card from "../Card";
import GamePlayerWebsocketService from "./Player.service";
import { LobbyUser } from "../../../Lobbies/lobbies.namespace";

export const GOOD_CARD_AMOUNT = 6 as const;
const allowedMissingCardCount = [0, 1, 2, 3, 4, 5, 6] as const;
export type AllowedMissingCardCount = (typeof allowedMissingCardCount)[number];
export const playerKinds = ["Defender", "Attacker", "Player"] as const;
export type PlayerKind = (typeof playerKinds)[number];

export default class Player {
  readonly info: LobbyUser;
  readonly hand: Hand;
  left!: Player;
  right!: Player;
  protected readonly wsService?: GamePlayerWebsocketService;

  constructor(lobbyUser: LobbyUser);
  constructor(player: Player);
  constructor(player: Player, wsService: GamePlayerWebsocketService);
  constructor(
    playerOrLobbyUser: LobbyUser | Player,
    wsService?: GamePlayerWebsocketService,
  ) {
    if (playerOrLobbyUser instanceof Player) {
      const player = playerOrLobbyUser;
      this.hand = player.hand;
      this.info = player.info;
      this.left = player.left;
      this.right = player.right;
      this.wsService = wsService || player.wsService;
      this.left.right = this;
      this.right.left = this;
    } else {
      this.hand = new Hand();
      this.info = playerOrLobbyUser;
    }
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(...cards);
    this.wsService?.receiveCards({ player: this, cards });
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

  get isDefender() {
    return false;
  }

  get isAttacker() {
    return false;
  }

  get isSuperPlayer() {
    return this.isAttacker || this.isDefender;
  }

  exitGame() {
    this.left.right = this.right;
    this.right.left = this.left;
    return this.wsService?.exitGame(this);
  }

  changeKindTo(newKind: PlayerKind | typeof Player) {
    this.wsService?.changeKind(newKind, this);
  }
}
