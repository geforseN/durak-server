import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import Hand from "../Deck/Hand";
import Card from "../Card";
import GameRound from "../GameRound";

const GOOD_CARD_AMOUNT = 6;
const allowedMissingCardCount = [0, 1, 2, 3, 4, 5, 6] as const;
export type AllowedMissingCardCount = typeof allowedMissingCardCount[number];

export default class Player {
  info!: LobbyUser;
  hand!: Hand;
  left!: Player;
  right!: Player;
  index!: number;

  constructor(param: LobbyUser | Player) {
    if (param instanceof Player) {
      this.initializeFromPlayer(param);
    } else this.initializeFromLobbyUser(param);
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(...cards);
  }

  get id(): string {
    return this.info.accname;
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(GOOD_CARD_AMOUNT - this.hand.count, 0) as AllowedMissingCardCount;
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
  }

  canTakeMore({ cardCount }: { cardCount: number }) {
    return this.hand.count > cardCount;
  }

  isPrimalAttacker({ round: { primalAttacker } }: { round: GameRound }) {
    return this.id === primalAttacker?.id;
  }
}
