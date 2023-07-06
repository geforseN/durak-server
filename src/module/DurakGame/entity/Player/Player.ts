import type { LobbyUser } from "../../../Lobbies/lobbies.namespace";
import type Card from "../Card";
import { Hand } from "../Deck";
import GamePlayerWebsocketService from "./Player.service";
import SidePlayersIndexes from "./SidePlayersIndexes";

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
  constructor(player: Player, index: number, players: Player[]);
  constructor(
    playerOrLobbyUser: LobbyUser | Player,
    wsServiceOrIndex?: GamePlayerWebsocketService | number,
    players?: Player[],
  ) {
    if (!(playerOrLobbyUser instanceof Player)) {
      const lobbyUser = playerOrLobbyUser;
      this.hand = new Hand();
      this.info = lobbyUser;
    } else {
      const player = playerOrLobbyUser;
      if (wsServiceOrIndex instanceof GamePlayerWebsocketService) {
        this.info = player.info;
        this.hand = player.hand;
        const wsService = wsServiceOrIndex;
        this.wsService = wsService;
      } else if (wsServiceOrIndex && players) {
        this.hand = player.hand;
        this.info = player.info;
        this.wsService = player.wsService;
        const index = wsServiceOrIndex;
        const indexes = new SidePlayersIndexes(index, players.length);
        this.left = players[indexes.leftPlayerIndex];
        this.right = players[indexes.rightPlayerIndex];
      } else {
        this.info = player.info;
        this.hand = player.hand;
        this.left = player.left;
        this.right = player.right;
        this.wsService = player.wsService;
        this.left.right = this;
        this.right.left = this;
        this.wsService?.emitOwnKind(this);
      }
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
}
