import type { AllowedMissingCardCount } from "@durak-game/durak-dts";
import type LobbyUser from "../../../Lobbies/entity/LobbyUser";
import type DurakGame from "../../DurakGame";
import type Card from "../Card";
import type { Hand } from "../Deck";
import Attacker from "./Attacker";
import Defender from "./Defender";
import type GamePlayerWebsocketService from "./Player.service";
import type SuperPlayer from "./SuperPlayer";
import { NonStartedGameUser } from "./NonStartedGameUser";
import { raise } from "../../../..";
import { GameMove } from "../GameMove";

export const GOOD_CARD_AMOUNT = 6 as const;

export default class Player<H extends Hand = Hand> {
  readonly info: LobbyUser;
  readonly hand: H;
  left!: Player;
  right!: Player;
  protected readonly wsService: GamePlayerWebsocketService;

  constructor(player: Player);
  constructor(
    nonStartedGamePlayer: NonStartedGameUser,
    additionalData?: { wsService?: GamePlayerWebsocketService; hand?: H },
  );
  // FIXME fix types
  constructor(
    player: NonStartedGameUser | Player,
    additionalData?: { wsService?: GamePlayerWebsocketService; hand?: H },
  ) {
    this.info = player.info;
    this.hand = additionalData?.hand || player.hand || raise();
    this.left = player.left;
    this.right = player.right;
    if (this.left) this.left.right = this;
    if (this.right) this.right.left = this;
    this.wsService = additionalData?.wsService || player.wsService || raise();
    this.wsService.emitOwnKind(this);
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

  isDefender(): this is Defender {
    return false;
  }

  isAttacker(): this is Attacker {
    return false;
  }

  isSuperPlayer(): this is SuperPlayer {
    return this.isAttacker() || this.isDefender();
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

  isAllowedToMove(): this is CanMakeMove {
    return false;
  }

  asDefender() {
    return new Defender(this);
  }

  asAttacker() {
    return new Attacker(this);
  }

  asPlayer() {
    return new Player(this);
  }
}

export interface CanMakeMove extends CanMakeBaseMove, CanMakeUpdateMove {}

interface CanMakeBaseMove {
  makeBaseMove(): GameMove;
}

interface CanMakeUpdateMove {
  makeInsertMove(...args: any[]): Promise<GameMove>;
  makeStopMove(...args: any[]): GameMove;
}

export interface CanMakeTransferMove {
  makeTransferMove(card: Card, slotIndex: number): GameMove;
}
