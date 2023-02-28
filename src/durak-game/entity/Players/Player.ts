import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import Hand from "../Deck/Hand";
import Card from "../Card";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../durak-game";

export interface CardPut {
  putCardOnDesk({ game, card, slotIndex, socket }: PlaceCardData & GameSocket): void | never;
}

export interface CardRemove {
  removeCard(card: Card): void | never;
}

export interface MoveStop {
  stopMove({ game }: { game: DurakGame }): void | never;
}

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

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receive(...cardsToReceive);
  }

  get missingNumberOfCards(): number {
    return 6 - this.hand.count;
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
}
