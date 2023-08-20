import assert from "node:assert";
import LobbyUser from "../../../Lobbies/entity/LobbyUser";
import DurakGame from "../../DurakGame";
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

  // TODO rework constructor, code is hard to understand
  // can create another classes (NonStartedGamePlayer, NonLinkedPlayer)
  constructor(lobbyUser: LobbyUser);
  constructor(player: Player);
  constructor(player: Player, wsService: GamePlayerWebsocketService);
  constructor(
    playerOrLobbyUser: LobbyUser | Player,
    wsServiceOrIndex?: GamePlayerWebsocketService | number,
  ) {
    if (!(playerOrLobbyUser instanceof Player)) {
      const lobbyUser = playerOrLobbyUser;
      this.hand = new Hand();
      this.info = lobbyUser;
      return; // NonStartedPlayer got constructed, can return
    }
    const player = playerOrLobbyUser;
    this.info = player.info;
    this.hand = player.hand;
    if (wsServiceOrIndex instanceof GamePlayerWebsocketService) {
      const wsService = wsServiceOrIndex;
      this.wsService = wsService;
      return;
    }
    this.wsService = player.wsService;
    this.left = player.left;
    this.right = player.right;
    this.left.right = this;
    this.right.left = this;
    this.wsService?.emitOwnKind(this);
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

  exitGame(game: DurakGame) {
    this.left.right = this.right;
    this.right.left = this.left;
    const me = game.initialPlayers.find((player) => player.id === this.id);
    if (me) {
      me.roundLeftNumber = game.round.number;
      me.place = ++game.leftPlayersCount;
    }
    return this.wsService?.exitGame(this);
  }
}
