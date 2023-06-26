import { Hand } from "../Deck";
import Card from "../Card";
import GameRound from "../GameRound";
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

  constructor(param: LobbyUser | Player) {
    if (param instanceof Player) {
      this.initializeFromPlayer(param);
    } else this.initializeFromLobbyUser(param);
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

  private initializeFromLobbyUser(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
    this.hand = new Hand();
  }

  private initializeFromPlayer(player: Player) {
    this.hand = player.hand;
    this.info = player.info;
    this.left = player.left;
    this.right = player.right;
    this.index = player.index;
    this.service = player.service;
  }

  canTakeMore({ cardCount }: { cardCount: number }) {
    return this.hand.count > cardCount;
  }

  isPrimalAttacker({ round }: { round: GameRound }): boolean | never {
    return this.id === round.primalAttacker.id;
  }

  injectService(playerService: GamePlayerService) {
    this.service = playerService;
  }

  static hasSameId(this: { id: string }, player: Player) {
    return this.id === player.id;
  }
}
